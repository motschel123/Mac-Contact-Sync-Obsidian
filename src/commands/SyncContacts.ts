import { normalizePath, Notice, Platform, TFile, TFolder, Command, TAbstractFile } from "obsidian";
import ContactsPlugin from "src/main";
import { DEFAULT_CONTACT_TEMPLATE } from "src/consts";
import { ContactsService } from "src/services/ContactsService";
import { ContactModel } from "src/models/ContactModel";
import { ContactFileReplaceRegex, PlaceholderMatchingRegex } from "src/consts";

export class SyncContacts implements Command {
  constructor(private plugin: ContactsPlugin) {} 

  id = 'sync-contacts';
  name = 'Sync Contacts';

  async GetContactTemplate(contactTemplatePath: string): Promise<string> {
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizePath(contactTemplatePath));
    if (!(file instanceof TFile)) {
      if (contactTemplatePath.trim() !== "") {
        new Notice(`Warning: Contact Template file not found at ${contactTemplatePath}. Using default template.`);
      }
      return DEFAULT_CONTACT_TEMPLATE;
    }

    return this.plugin.app.vault.cachedRead(file).then((content) => {
      if (content == null) {
        if (contactTemplatePath.trim() !== "") {
          new Notice(`Warning: Contact Template file is empty. Using default template.`);
        }
        return DEFAULT_CONTACT_TEMPLATE;
      }
      return content;
    });
  }

  FillStringPlaceholders(template: string, contact: ContactModel): string {
    const filledTemplate = template.replace(PlaceholderMatchingRegex, (placeholder) => {
      let param = placeholder.replace(/{|}/g, '').trim();
      if (!contact.hasOwnProperty(param))
        throw new Error(`Illegal placeholder ${String(param)} in template.`);
      let value = contact[param as keyof ContactModel];
      return Array.isArray(value) ? '['.concat((value as Array<string>).join(', '), ']') : String(value);
    });
    return filledTemplate;
  }

  ContactToFilePromise(contact: ContactModel, contactFilenameTemplate: string, contactTemplate: string): Promise<void> {
    let filename = this.FillStringPlaceholders(contactFilenameTemplate, contact);
    let filepath = normalizePath(`${this.plugin.settings.ContactDirectory}/${filename}.md`);
    let filledTemplate = this.FillStringPlaceholders(contactTemplate, contact);
    let contactFile: TAbstractFile | null = this.plugin.app.vault.getAbstractFileByPath(filepath)

    if (contactFile instanceof TFile) {
      let replaceContentRegex = ContactFileReplaceRegex();
      return this.plugin.app.vault.process(contactFile, (oldContent: string) => {      
        return oldContent.replace(replaceContentRegex, filledTemplate);
      }).then((_) => {});
    } else if (contactFile === null) {
      return this.plugin.app.vault.create(filepath, filledTemplate).then((_) => {});
    } else {
      console.error(`Error: ${filepath} is a folder`);
      new Notice(`Error: ${filepath} is a folder`);
      return Promise.reject();
    } 
  }

  callback = async () =>  {
    if (!Platform.isMacOS) 
      return new Notice("Error: This plugin only works on MacOS");
    
    // Initialize Services
    let contactsService = new ContactsService(this.plugin.settings.ContactsGroup)
    
    // Setup
    try {
      if (await this.plugin.app.vault.adapter.exists(normalizePath(this.plugin.settings.ContactDirectory)) == false)
            await this.plugin.app.vault.createFolder(this.plugin.settings.ContactDirectory);
        else if (!(this.plugin.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.ContactDirectory)) instanceof TFolder))
            throw new Error(`${this.plugin.settings.ContactDirectory} exists and is not a folder.`);
    } catch (error) {
      new Notice(`Error creating contacts folder: ${error}`);
      console.error(`Error creating contacts folder: ${error}`);
      return;
    }

    let numContacts = await contactsService.getNumberOfContacts();
    let successfulContacts = 0;

    let contactFilenameTemplate = this.plugin.settings.FilenameTemplateContact;
    let contactTemplate = await this.GetContactTemplate(this.plugin.settings.ContactTemplatePath);

    let userInfoNotice = new Notice(`Syncing Contacts ${successfulContacts}/${numContacts}...`, 0);
    // this.plugin.addStatusBarItem().createEl('span', {text: `Syncing Contacts 0/${numContacts}`});
    let promises: Array<Promise<void>> = [];
    let contactStream = contactsService.getContactStream();

    contactStream.on('data', (contact: ContactModel) => {
      promises.push(
        this.ContactToFilePromise(contact, contactFilenameTemplate, contactTemplate)
        .then((_) => {
          userInfoNotice.setMessage(`Syncing Contacts ${successfulContacts++}/${numContacts}...`);
        })
        .catch((error) => console.error(`Error syncing contact ${contact.Name}\n${error}`))
      )});

    promises.push(new Promise<void>((resolve, reject) => {
      contactStream.on('error', reject);
      contactStream.on('end', resolve); 
    }));

    await Promise.all(promises)
    .catch((error) => {
      new Notice("Error occurred during contact sync. Check console for details.");
      console.error(error);
    }).finally(() => {
      userInfoNotice.hide();
      new Notice(`Successfully synced ${successfulContacts}/${numContacts} Contacts`)
    });
  };
}