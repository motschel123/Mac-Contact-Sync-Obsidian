import { Notice } from 'obsidian';
const vCard = require('vcf');

export default class VCardObject {
	version: string;

	fn?: string;
	nickname?: string;
	emails?: Array<string>;
	title?: string;
	organization?: string;
	//photo?: string;
	telephones?: Array<[string, string]>;
	addresses?: Array<[string, string]>;
	birthdate?: Date;
	URLs?: Array<string>;
	notes?: string;

	constructor(
		card: typeof vCard
	) {
		this.version = card.version;
		this.fn = card.get("fn")?.valueOf();
		
		this.nickname = card.get("nickname")?.valueOf() ?? undefined;
		this.organization = this.parseOrganization(card.get("org"));
		this.title = card.get("title")?.valueOf() ?? undefined;
		this.telephones = this.parseTelephones(card.get("tel"));
		this.addresses = this.parseAddresses(card.get("adr"));
		this.emails = this.parseEmails(card.get("email"));
		this.birthdate = this.parseBirthdate(card.get("bday"));
		this.URLs = this.parseURLs(card.get("url"));
		this.notes = this.parseNotes(card.get("note"));
		//this.photo = card.get("photo")?.valueOf() ?? undefined;
		
		// Inform user of vCard without name
		if (this.fn == undefined) {
			console.debug(`Found vCard without name: \n ${JSON.stringify(this, null, 2)}`);
			new Notice('Contact without name found. Check developer console for details.')
		}
	}
	
	getFilename(): string {
		return this.fn ?? "NO_NAME";
	}

	toMarkdown(enabledFields: string): string {
		let markdown = `## 👤 ${this.fn}\n`;

		this.getVCardFields().forEach((field) => {
			if (!enabledFields.includes(field)) return;

			markdown += this.fieldToMarkdown(field) ?? '';
		});

		return markdown.trim();
	}

	private fieldToMarkdown(field: string): string | undefined {
		if (typeof (this as any)[field] === 'undefined') return undefined;

		switch (field) {
			case 'nickname':
				return `- Nickname: ${this.nickname}\n`;
			case 'notes':
				return `- 📝 Notes: \n\t${this.notes}\n`;
			case 'birthdate':
				return `- 🎂 Birthday: ${this.birthdate?.toLocaleDateString()}\n`;
			case 'organization':
				return `- 🏢 Organization: ${this.organization}\n`;
			case 'title':
				return `- 👔 Title: ${this.title}\n`;
			case 'emails':
				return this.emails?.map((mail) => {
					return `- 📧 [${mail}](mailto:${mail})\n`
				}).join('');
			case 'URLs':
				return this.URLs?.map(URL => {
					return `- 🌐 Website: [${URL}](${URL})\n`;
				}).join('');
			case 'telephones':
				return this.telephones?.map(([type, tel]) => {
					let emotes = ``;
					const types = type.split(',');
					switch (types[0]) {
						case 'cell':
							emotes += '📱';
							break;
						case 'home':
							emotes += '🏠';
							break;
						case 'work':
							emotes += '🏢';
							break;
						default:
							emotes += '☎️';
					}
					switch (types[1]) {
						case 'voice':
							emotes += '📞';
							break;
						case 'fax':
							emotes += '📠';
							break;
						default:
					}
	
					return `- ${emotes} [${tel}](tel:${tel.replace(' ', '')})\n`
				}).join('');
			case 'addresses':
				return this.addresses?.map(([type, adr]) => {
					let emotes = ``;
					switch (type) {
						case 'home':
							emotes += '🏠';
							break;
						case 'work':
							emotes += '🏢';
							break;
						default:
							emotes += '☎️';
					}
	
					let [_, __, street, city, ___, postcode, country] = adr.valueOf().split(';')
	
					return `- ${emotes} ${type} address:\n\t${street}\n\t${postcode} ${city}\n\t${country}\n`
				}).join('');
			
			default:
				console.error(`Error: Unknown field or markdown convertion: ${field}`);
				return undefined;
		}
	}

	private parseBirthdate(bday: typeof vCard.Property): Date | undefined {
		let birthdate: Date | undefined = undefined;
		
		if (bday) {
			birthdate = new Date(Date.parse(bday.valueOf()));
		}
		return birthdate;
	}

	private parseURLs(URLs: typeof vCard.Property): Array<string> | undefined {
		let links: Array<string> | undefined = undefined;
		
		if (URLs) {
			links = new Array<string>();

			if (!Array.isArray(URLs)) {
				URLs = [URLs];
			}
			for (let url of URLs) {
				links.push(url.valueOf());
			}
		}
		return links;
	}

	private parseNotes(notes: typeof vCard.Property): string | undefined {
		let notesString: string | undefined = undefined;
		
		if (notes) {
			notesString = notes.valueOf()?.split('\\n').map((line: string) => line.endsWith('\\') ? line.slice(0, line.length-2) : line).join('\n\t');
		}
		return notesString;
	}

	private parseEmails(email: typeof vCard.Property): Array<string> | undefined {
		let emails: Array<string> | undefined = undefined;
		
		if (email) {
			emails = new Array<string>();
			if (!Array.isArray(email)) {
				email = [email];
			}
			for (let mail of email) {
				emails.push(mail.valueOf());
			}
		}
		return emails;
	}

	private parseAddresses(adr: typeof vCard.Property): Array<[string, string]> | undefined {
		let addresses: Array<[string, string]> | undefined = undefined;
		
		if (adr) {
			addresses = new Array<[string, string]>();
			if (!Array.isArray(adr)) {
				adr = [adr];
			}
			for (let address of adr) {
				let type;
				if (typeof address.type == 'string') 
					type = address.type?.toLowerCase() ?? 'home';
				else if (Array.isArray(address.type))
					type = (address.type?.[0]?.toLowerCase() ?? 'home');
				addresses.push([type, address.valueOf()]);
			}
		}
		return addresses;
	}

	private parseTelephones(tel: typeof vCard.Property): Array<[string, string]> | undefined {
		let telephones: Array<[string, string]> | undefined = undefined;
		
		if (tel) {
			telephones = new Array<[string, string]>();
			if (!Array.isArray(tel)) {
				tel = [tel];
			}
			for (let telephone of tel) {
				let type = (telephone.type?.[0]?.toLowerCase() ?? 'phone') + ',' + (telephone.type?.[1]?.toLowerCase() ?? 'voice');
				telephones.push([type, telephone.valueOf()]);
			}
		}
		return telephones;
	}

	private parseOrganization(org: typeof vCard.Property): string | undefined {
		let organization: string | undefined = undefined;
		
		if (org) {
			organization = org.valueOf().replace(';', ', ')
		}
		return organization;
	}

	static getVCardFields(): Array<string> {
		const JSON_VCARD = ["vcard",[["version",{},"text","4.0"], ["fn",{},"text","name"]]];
		const inst = new VCardObject(vCard.fromJSON(JSON_VCARD));
		return inst.getVCardFields();
	}

	getVCardFields(): Array<string> {
		return Object.getOwnPropertyNames(this)
			.filter(prop => (prop !== 'constructor' && typeof (this as any)[prop] !== 'function') && prop !== 'version' && prop !== 'fn');
	}
}