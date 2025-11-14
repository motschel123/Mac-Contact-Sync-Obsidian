
export const KEEP_CONTENT_SEPARATOR: string = "%%==MACOS_CONTACT_SYNC_KEEP==%%";

export const PlaceholderMatchingRegex: RegExp = /{{\s*([\w]+)\s*}}/g;

export const VCardPhotoRegex = /^(PHOTO;| ).*?$(\r\n?|\n)/gm;

export const VCardRegex = /^BEGIN:VCARD[\s\S]*END:VCARD$/sm;
export const VCardExcludePhotoRegex = /^BEGIN:VCARD(?![\s\S]*?^PHOTO)[\s\S]*END:VCARD$/sm;

export const ContactFileReplaceRegex = (): RegExp => new RegExp(`.*?(?=${KEEP_CONTENT_SEPARATOR}|$)`, 's');

export const DEFAULT_CONTACT_TEMPLATE: string = `---
Nickname: {{Nickname}}
FirstName: {{FirstName}}
MiddleName: {{MiddleName}}
LastName: {{LastName}}
Organization: {{Organization}}
Department: {{Department}}
JobTitle: {{Title}}
Emails: {{Emails}}
PhoneNumbers: {{PhoneNumbers}}
Addresses: {{Addresses}}
URLs: {{URLs}}
BirthDate: {{BirthDate}}
---
{{Note}}`;