import { Plugin } from 'obsidian';
import { CommandHandler } from './handlers/CommandHandler';
import { ContactsPluginSettings, ContactsSettingTab, DEFAULT_SETTINGS } from './Settings';

export default class ContactsPlugin extends Plugin {
	settings: ContactsPluginSettings;
	commandHandler: CommandHandler;

	async onload() {
		await this.loadSettings();

		this.commandHandler = new CommandHandler(this)
		this.commandHandler.setup()

		this.addSettingTab(new ContactsSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
