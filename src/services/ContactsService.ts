import VCard from '../VCard';
import { IOsaScriptService, OsaScriptService } from './OsascriptService';

const vcf = require('vcf');

export interface IContactsService {
    readonly groupName: string;
    readonly enabledContactFields: string;

    loadContactData_Markdown(): Promise<Map<string, string>>;
    getNumberOfContacts(): Promise<number>;
    getVCards(): Promise<VCard[]>;
}

export class ContactsService implements IContactsService {
	readonly osaScriptService: IOsaScriptService;

    readonly groupName: string;
    readonly enabledContactFields: string;

    readonly GROUP_NOT_DEFINED_ERROR = "GROUP NOT DEFINED";

    constructor(groupName: string, enabledContactFields: string, osaScriptService: IOsaScriptService = new OsaScriptService() ) {
		this.groupName = groupName;
        this.enabledContactFields = enabledContactFields;
		this.osaScriptService = osaScriptService
    }


    async loadContactData_Markdown(): Promise<Map<string, string>> {
    	let vCards: VCard[] = await this.getVCards();
			// Filter out vCards without names
			vCards = vCards.filter((vcard) => {
				return vcard.fn != undefined;
			});

			const filenameToMarkdown = new Map<string, string>();
			for (let vcard of vCards) {
				filenameToMarkdown.set(vcard.getFilename(), vcard.toMarkdown(this.enabledContactFields));
			}
			return filenameToMarkdown;
    }

		// async loadContactData(): Promise<Map<string, string>> {
		// 	return new Map<string, string>();
		// }

    async getNumberOfContacts(): Promise<number> {
        const JXA_SCRIPT = `
			let Contacts = Application('Contacts');
			Contacts.includeStandardAdditions = true;

			let groups = Contacts.groups.whose({ name: '${this.groupName}'});
			if (groups.length === 0 || groups === undefined || groups === null)
			 	throw new Error('${this.GROUP_NOT_DEFINED_ERROR}');

			groups[0].people.length;
		`;

		let resultPromise = this.osaScriptService.executeScript(JXA_SCRIPT).then<number>((resultStr) => {
			let resultInt = parseInt(resultStr);
			if (isNaN(resultInt)) {
				throw new Error(`Non-numeric result from JXA script: ${resultStr}`);
			}
			return resultInt;
		})

		return await resultPromise;
	}

    async getVCards(): Promise<VCard[]> {
		const JXA_SCRIPT = `
			ObjC.import('Foundation');
			const stdout = $.NSFileHandle.fileHandleWithStandardOutput;

			let Contacts = Application('Contacts');
			Contacts.includeStandardAdditions = true;

			let groups = Contacts.groups.whose({ name: '${this.groupName}'});
			if (groups.length === 0 || groups === undefined || groups === null)
			 	throw new Error('${this.GROUP_NOT_DEFINED_ERROR}');

			for (let vcard of groups[0].people.vcard()) {
				// Write to stdout
				const nsString = $.NSString.alloc.initWithUTF8String(vcard);
				const data = nsString.dataUsingEncoding($.NSUTF8StringEncoding);
				stdout.writeData(data);
			}
		`;
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
}