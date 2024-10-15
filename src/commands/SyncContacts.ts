import { normalizePath, Notice, Platform, TFile, TFolder, Command } from "obsidian";
import { IContactsService, ContactsService } from "src/services/ContactsService";
import { IFileService, FileService, ContentSeperator } from "src/services/FileService";

import ContactsPlugin from "src/main";

export class SyncContactsCmd implements Command {
  constructor(private plugin: ContactsPlugin) {} 

  id = 'sync-contacts';
  name = 'Sync Contacts';

  callback = async () =>  {
    if (!Platform.isMacOS) 
      return new Notice("Error: This plugin only works on MacOS");
    
    new Notice('Syncing...')
    
    let contactsService: IContactsService = new ContactsService(this.plugin.settings.contactsGroup, this.plugin.settings.enabledContactFields)
    let numContactsPromise = contactsService.getNumberOfContacts().then((numContacts) => {
      new Notice(`Found ${numContacts} Contacts in group ${this.plugin.settings.contactsGroup}`)
      return numContacts
    })

    let fileService: IFileService = new FileService();
    let createFolderPromise = fileService.createFolder(this.plugin.settings.contactsFolder, this.plugin.app)

    let contentSeperator = new ContentSeperator(
      this.plugin.settings.autogenerationStartTag, 
      this.plugin.settings.autogenerationStartText, 
      this.plugin.settings.autogenerationEndTag, 
      this.plugin.settings.autogenerationEndText,
    )

    let [numContacts, _] = await Promise.all([numContactsPromise, createFolderPromise])

    // Load contacts from MacOS "Contacts" and save to files
    let markdownResults = await contactsService.loadContactData_Markdown();
    let successfulContacts = 0
    let promises: Array<Promise<any>> = [];
    for (let [filename, markdown] of markdownResults) {
      let filePath = normalizePath(`${this.plugin.settings.contactsFolder}/${filename}.md`);
      let file = this.plugin.app.vault.getAbstractFileByPath(filePath);
      
      let newContactInfo = contentSeperator.buildContentString(markdown);

      // contactFile is a folder 
      if (file instanceof TFolder) {
        console.error(`Error: ${filePath} is a folder`);
        new Notice(`Error: ${filePath} is a folder`);
      // contactFile doesn't exist yet
      } else if (file === null) {
        promises.push(
          fileService.saveFile(filePath, newContactInfo, this.plugin.app)
            .then((_) => successfulContacts++)
            .catch((error) => console.error(`Error syncing ${filename}\n${error}`))
        );
      // contactFile exists
      } else if (file instanceof TFile) {
        promises.push(
          // extract the old contact info and replace it with the new data
          fileService.updateFile(file, newContactInfo, new ContentSeperator(this.plugin.settings.autogenerationStartTag, this.plugin.settings.autogenerationStartText, this.plugin.settings.autogenerationEndTag, this.plugin.settings.autogenerationEndText), this.plugin.app)
          .then((_) => successfulContacts++)
          .catch((error) => console.error(`Error syncing ${filename}\n${error}`))
        );
      }
    }

    await Promise.all(promises)
    .catch((error) => {
      new Notice("Error syncing contacts!");
      console.error(error);
    }).finally(() => {
      new Notice(`Successfully synced ${successfulContacts} of ${numContacts} Contacts`)
      console.info(`Successfully synced ${successfulContacts} of ${numContacts} Contacts`)
    });
  }
}