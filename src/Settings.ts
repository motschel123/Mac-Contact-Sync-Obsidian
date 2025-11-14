import { PluginSettingTab, App, Setting } from "obsidian";
import ContactsPlugin from "./main";
import { FolderSuggest } from "./suggesters/FolderSuggester";

export const DEFAULT_SETTINGS: ContactsPluginSettings = {
	ContactsGroup: 'Obsidian',
	ContactDirectory: 'Contacts',
	FilenameTemplateContact: '{{Name}}',
	ContactTemplatePath: '',
}

export interface ContactsPluginSettings {
	ContactsGroup: string
	ContactDirectory: string
	FilenameTemplateContact: string
	ContactTemplatePath: string
}

export class ContactsSettingTab extends PluginSettingTab {
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
			.setDesc('Folder in which to save the generated notes of your contacts')
			.addSearch((searchQuery) => {
				new FolderSuggest(this.app, searchQuery.inputEl)
				searchQuery.setPlaceholder('Select a folder')
						.setValue(this.plugin.settings.ContactDirectory)
						.onChange(async (newFolder) => {
							this.plugin.settings.ContactDirectory = newFolder;
							await this.plugin.saveSettings();
						});
		});
		
		new Setting(containerEl)
			.setName('Contacts group')
			.setDesc('Name of the group ("Smart List") you want to synchronize, configured in the MacOS Contacts app')
			.addText(text => text
				.setPlaceholder('Obsidian')
				.setValue(this.plugin.settings.ContactsGroup)
				.onChange(async (value) => {
					this.plugin.settings.ContactsGroup = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Contact Template file')
			.setDesc('Path to the template file that is used to create notes for contacts')
			.addText(text => text
				.setPlaceholder('Example: folder/template.md')
				.setValue(this.plugin.settings.ContactTemplatePath ?? '')
				.onChange(async (value) => {
					this.plugin.settings.ContactTemplatePath = value;
					await this.plugin.saveSettings();
				}));
	}
}