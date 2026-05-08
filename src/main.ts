import { Plugin } from 'obsidian';
import { ContactsPluginSettings, ContactsSettingTab, DEFAULT_SETTINGS } from './Settings';
import { SyncContacts } from './commands/SyncContacts';

export default class ContactsPlugin extends Plugin {
	settings!: ContactsPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand(new SyncContacts(this));

		this.addSettingTab(new ContactsSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
