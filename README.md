# Mac Contact Sync Plugin for Obsidian

<p align="center">
	<img src="https://img.shields.io/github/manifest-json/v/motschel123/Mac-Contact-Sync-Obsidian?color=blue">
    <img src="https://img.shields.io/github/release-date/motschel123/Mac-Contact-Sync-Obsidian">
	<img src="https://img.shields.io/github/license/motschel123/Mac-Contact-Sync-Obsidian">
	<img src="https://img.shields.io/github/downloads/motschel123/Mac-Contact-Sync-Obsidian/total">
	<img src="https://img.shields.io/github/issues/motschel123/Mac-Contact-Sync-Obsidian">
</p>

<p align="center">
A Plugin to synchronize Obsidian with contact data from your Mac's Contacts Application.
</p>

***If your are updating this plugin from any version <2.0.0: BACKUP your previous contact notes: !! THEY WILL BE OVERWRITTEN !!***

	
## Features

- Sync contacts from your Mac's Contacts app to Obsidian
- Contacts to sync can be filtered directly in the Contacts App
- Creates contact files from a configurable template

## Usage

1. Install the plugin
2. Create the specified ´Smart List´ in the your Contacts App (See [Creating a Smart List](#creating-a-smart-list))
3. Disable 'Export photos in vcard' by going to the settings of your Contacts App.
4. Configure the Plugin Settings:
   - Set the name of your created Smart List
   - Select a folder for the created Notes
   - Configure a custom template (See [Templates](#templates))
5. Run the command `Sync Contacts on macOS: Syncs contacts` to sync your contacts
6. After syncing, you will see a notification stating how many Contacts have been synced

## Creating a Smart List 
Smart Lists are a native feature of your Contacts App. To create a new Smart List open your Contacts application and use the menu bar to navigate to: `File > Smart Lists > New Smart List`. 
Give it a name (default plugin setting is 'Obsidian'), and configure which of your contacts should be included.

## Templates
The default template can be found at https://github.com/motschel123/Mac-Contact-Sync-Obsidian/blob/main/src/consts.ts.

You can use a custom template to define how the data will be saved in your notes. Tags in the form of `{{tag}}` will be replaced with the corresponding data. The following tags are available:
```
{{Name}}
{{Nickname}}
{{FirstName}}
{{MiddleName}}
{{LastName}}
{{MaidenName}}
{{Title}}
{{JobTitle}}
{{Department}}
{{Organization}}
{{Suffix}}
{{HomePage}}
{{BirthDate}}
{{PhoneticFirstName}}
{{PhoneticMiddleName}}
{{PhoneticLastName}}
{{Note}}
```

## Regenerating Notes
When a Note for a given Contact already exists, it's contents will be overwritten. To keep certain content in your contact notes accross multiple runs of the sync command you can use the delimiter string:
```%%==MACOS_CONTACT_SYNC_KEEP==%%```
Everything after this will not be replaces when re-running the command.


## Notes
- In order to communicate with the Contacts app this plugin runs an AppleScript: when asked for permission, **allow Obsidian to access the Contacts app or this Plugin won't work.**
- If you experience issues with the sychronization of contacts please make sure you have disabled 'export photos in vcard' in your Contacts App before creating an Issue.
- This plugin is not affiliated with Apple in any way.
