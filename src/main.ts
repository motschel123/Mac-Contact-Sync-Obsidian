import { App, Notice, Platform, Plugin, PluginSettingTab, Setting, TFile, TFolder, normalizePath } from 'obsidian';
import VCard from './vcard';
import { IContactsService, ContactsService } from './contactsService';

interface ContactsPluginSettings {
	contactsGroup: string;
	contactsFolder: string;
	autogenerationStartTag: string
	autogenerationStartText: string
	autogenerationEndTag: string
	autogenerationEndText: string
	enabledContactFields: string
}

class SettingTab extends PluginSettingTab {
	plugin: ContactsPlugin;

	constructor(app: App, plugin: ContactsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Contacts folder')
			.setDesc('Select the folder in which your contacts will stored')
			.addText(text => text
				.setPlaceholder('Contacts')
				.setValue(this.plugin.settings.contactsFolder)
				.onChange(async (value) => {
					this.plugin.settings.contactsFolder = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Contacts group')
			.setDesc('Enter the name of the group ("Smart List") in which your contacts are stored in the MacOS Contacts app')
			.addText(text => text
				.setPlaceholder('Obsidian')
				.setValue(this.plugin.settings.contactsGroup)
				.onChange(async (value) => {
					this.plugin.settings.contactsGroup = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Configure the shown contact fields below')
			.setDesc('To update the shown contact fields, re-sync your contacts')

		for (let attribute of VCard.getVCardFields()) {
			new Setting(containerEl)
				.setName(`${attribute}`)
				.addToggle((toggle) => {
					toggle.setValue(this.plugin.settings.enabledContactFields.includes(attribute))
					toggle.onChange(async (value) => {
						this.plugin.settings.enabledContactFields = this.toggleEnabledField(attribute, value);
						await this.plugin.saveSettings();
						console.debug(this.plugin.settings.enabledContactFields)
					});
				});
		}
	}

	toggleEnabledField(field: string, value: boolean): string {
		let enabledFields = this.plugin.settings.enabledContactFields.split(',');
		if (value) {
			enabledFields.push(field);
		} else {
			enabledFields = enabledFields.filter((enabledField) => enabledField != field);
		}
		return enabledFields.join(',');
	}
}

const DEFAULT_SETTINGS: ContactsPluginSettings = {
	contactsGroup: 'Obsidian',
	contactsFolder: 'Contacts',
	autogenerationStartTag: "START",
	autogenerationStartText: "Content BELOW this line is AUTOGENERATED and will be REPLACED.",
	autogenerationEndTag: "END",
	autogenerationEndText: "Content ABOVE this line is AUTOGENERATED and will be REPLACED.",
	enabledContactFields: 'nickname,emails,title,organization,telephones,addresses,birthdate,URLs,notes'
}

export default class ContactsPlugin extends Plugin {
	settings: ContactsPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'sync-contacts',
			name: 'Sync contacts',
			callback: async () =>  {
				if (!Platform.isMacOS) 
					return new Notice("Error: This plugin only works on MacOS");

				// Find/Create contacts folder
				if (await this.app.vault.adapter.exists(normalizePath(this.settings.contactsFolder)) == false)
					await this.app.vault.createFolder(this.settings.contactsFolder);

				new Notice('Syncing...')
				
				const loadContactsLogic: IContactsService = new ContactsService(this.settings.contactsGroup, this.settings.enabledContactFields)

				let numberOfFoundContacts = await loadContactsLogic.getNumberOfContacts();
				new Notice(`Found ${numberOfFoundContacts} Contacts in group ${this.settings.contactsGroup}`)

				// Load contacts from MacOS "Contacts"
				let markdownResults = await loadContactsLogic.loadContacts();
				// Save all contacts into file
				let successfulContacts = 0
				let promises: Array<Promise<any>> = [];
				for (let [filename, markdown] of markdownResults) {
					// Setup File
					let normPath = normalizePath(`${this.settings.contactsFolder}/${filename}.md`);
					let contactFile = this.app.vault.getAbstractFileByPath(normPath);
					let newContactInfo = `<!-- ${this.settings.autogenerationStartTag} ${this.settings.autogenerationStartText} --> \n${markdown} \n<!-- ${this.settings.autogenerationEndTag} ${this.settings.autogenerationEndText} -->`;
					
					// contactFile is a folder 
					if (contactFile instanceof TFolder) {
						console.error(`Error: ${filename} is a folder`);
						new Notice(`Error: ${filename} is a folder`);
					// contactFile doesn't exist yet
					} else if (contactFile === null) {
						promises.push(
							this.app.vault.create(normPath, newContactInfo)
							.then((_) => successfulContacts++)
							.catch((error) => console.error(`Error syncing ${filename}\n${error}`))
						);
					// contactFile exists
					} else if (contactFile instanceof TFile) {
						promises.push(
							// extract the old contact info and replace it with the new data
							this.app.vault.process(contactFile, (oldContent) => {
								let lines = oldContent.split("\n");
								
								let startReplacementIndex = lines.findIndex((line) => line.startsWith("<!-- " + this.settings.autogenerationStartTag));
								let endReplacementIndex = lines.findIndex((line) => line.startsWith("<!-- " + this.settings.autogenerationEndTag));

								let newLines = Array<string>();

								for (let i = Math.min(0, startReplacementIndex); i < lines.length; i++) {
									if (i == startReplacementIndex) {
										newLines.push(newContactInfo);
									} else if (i >= startReplacementIndex && i <= endReplacementIndex) {
										continue;
									} else {
										newLines.push(lines[i]);
									}
								}
								return newLines.join("\n");							
							})
							.then((_) => successfulContacts++)
							.catch((error) => console.error(`Error syncing ${filename}\n${error}`))
						);
					}
				}

				Promise.all(promises)
				.catch((error) => {
					new Notice("Error syncing contacts!");
					console.error(error);
				}).finally(() => {
					new Notice(`Successfully synced ${successfulContacts} of ${numberOfFoundContacts} Contacts`)
					console.info(`Successfully synced ${successfulContacts} of ${numberOfFoundContacts} Contacts`)
				});
			}
		});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
