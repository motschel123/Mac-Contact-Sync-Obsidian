import VCard from '../vcard';
import { OsaScriptService } from './OsascriptService';
import { Readable, Transform } from 'stream';
import { ContactModel } from 'src/models/ContactModel';
import { VCardPhotoRegex } from 'src/consts';

const vcf = require('vcf');

export class ContactsService {
	readonly osaScriptService: OsaScriptService;

    readonly groupName: string;

    readonly GROUP_NOT_DEFINED_ERROR = "GROUP NOT DEFINED";

    constructor(groupName: string, osaScriptService = new OsaScriptService() ) {
		this.groupName = groupName;
		this.osaScriptService = osaScriptService
    }
	
	async getNumberOfContacts(): Promise<number> {
        const JXA_SCRIPT = `
let Contacts = Application('Contacts');
Contacts.includeStandardAdditions = true;

let groups = Contacts.groups.whose({ name: '${this.groupName}'});
if (groups === undefined || groups === null || groups.length === 0)
	throw new Error('${this.GROUP_NOT_DEFINED_ERROR}');
if (groups.length > 1)
	throw new Error('Multiple groups found for name: ${this.groupName}');

groups[0].people.length;`;

		return this.osaScriptService.executeScript(JXA_SCRIPT).then<number>((resultStr) => {
			let resultInt = parseInt(resultStr);
			if (isNaN(resultInt)) {
				throw new Error(`Non-numeric result from JXA script: ${resultStr}`);
			}
			return resultInt;
		})
	}
	
	async getVCards(): Promise<VCard[]> {
		const JXA_SCRIPT = `
ObjC.import('stdlib');
ObjC.import('Foundation');

let stdout = $.NSFileHandle.fileHandleWithStandardOutput;

let Contacts = Application('Contacts');
Contacts.includeStandardAdditions = true;

let groups = Contacts.groups.whose({ name: '${this.groupName}' });
if (groups.length === 0 || groups === undefined || groups === null) {
	throw new Error('GROUP_NOT_DEFINED_ERROR');
}


let people = groups[0].people;
for (let i = 0; i < people.length; i++) {
    stdout.writeData($.NSString.alloc.initWithUTF8String(people[i].vcard().replace(/^PHOTO.*?==$/sm, '')).dataUsingEncoding($.NSUTF8StringEncoding));
}`;
		const vCardRegex = /BEGIN:VCARD[\s\S]*?END:VCARD/g;
		let resultPromise = this.osaScriptService.executeScript(JXA_SCRIPT).then<VCard[]>((vCardStr) => {
			let matches =  vCardStr.match(vCardRegex);
			
			let vCards: VCard[] = [];
			for (let match of matches ?? []) {
				const card = new vcf().parse(match);
				const vCardObj = new VCard(card);
				vCards.push(vCardObj);
			}

			return vCards;
		});

		return await resultPromise;
    }
    
	getContactStream(): Readable {
		const JXA_SCRIPT = `
ObjC.import('Foundation');

const stdout = $.NSFileHandle.fileHandleWithStandardOutput;

const Contacts = Application('Contacts');
Contacts.includeStandardAdditions = true;

let groups = Contacts.groups.whose({ name: '${this.groupName}'});
if (groups === undefined || groups === null || groups.length === 0)
	throw new Error('${this.GROUP_NOT_DEFINED_ERROR}');
if (groups.length > 1)
	throw new Error('Multiple groups found for name: ${this.groupName}');


let vcards = groups[0].people.vcard();

for (let vcard of vcards) {
	// if (vcard.search(/^PHOTO;/) !== -1) continue;
	stdout.writeData($.NSString.alloc.initWithUTF8String(vcard.replace(${VCardPhotoRegex}, '')).dataUsingEncoding($.NSUTF8StringEncoding));
    $.NSThread.sleepForTimeInterval(0.005);
}
$.NSThread.sleepForTimeInterval(1);
stdout.synchronizeAndReturnError(null);
$.NSThread.sleepForTimeInterval(1);
stdout.closeAndReturnError(null);
$.NSThread.sleepForTimeInterval(1);`;

		const vCardRegex = /^BEGIN:VCARD[\s\S]*END:VCARD$/sm;
		const checkValidVCard = new Transform({
			objectMode: true,
			transform(chunk: string, _enc, callback) {
				if (vCardRegex.test(chunk)) {
					let contact = ContactModel.fromVCardString(chunk);
					this.push(contact);
				} else {
					console.debug('Skipped vCard (invalid vCard):', chunk);
				}
				callback();
			}
		});

		return this.osaScriptService.executeScriptStream(JXA_SCRIPT).pipe(checkValidVCard);
	}
}