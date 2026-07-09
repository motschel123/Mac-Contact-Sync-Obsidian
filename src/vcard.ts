import vcf from 'vcf';

type VCardInstance = InstanceType<typeof vcf>;
type VCardProperty = vcf.Property;
type VCardPropertyWithType = VCardProperty & { type?: string | string[] };
type VCardPropertyValue = VCardProperty | VCardProperty[] | undefined;

export default class VCard {
	version: string = '';

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
	xabuid?: string;

	constructor(
		card: VCardInstance
	) {
		this.version = card.version ?? '';
		this.fn = this.getSingleValue(card.get('fn'))?.replace(/\\,/g, ',');
		this.nickname = this.getSingleValue(card.get('nickname'));
		this.organization = this.parseOrganization(card.get('org'));
		this.title = this.getSingleValue(card.get('title'));
		this.telephones = this.parseTelephones(card.get('tel'));
		this.addresses = this.parseAddresses(card.get('adr'));
		this.emails = this.parseEmails(card.get('email'));
		this.birthdate = this.parseBirthdate(card.get('bday'));
		this.URLs = this.parseURLs(card.get('url'));
		this.notes = this.parseNotes(card.get('note'));
		this.xabuid = this.parseXAbuid(card.get('xAbuid'));
		//this.photo = card.get("photo")?.valueOf() ?? undefined;
		
		// Inform user of vCard without name
		if (this.fn == undefined) {
			console.debug(`Found vCard without name: \n ${JSON.stringify(this, null, 2)}`);
			//new Notice('Contact without name found. Check developer console for details.')
		}
	}
	
	getFilename(): string {
		return this.fn ?? "NO_NAME";
	}

	toMarkdown(enabledFields: string): string {
		let markdown = `## 👤 ${this.fn}\n\n[Open in Contacts](addressbook://${this.xabuid?.replace(":","%3A")})\n\n`;
		this.getVCardFields().forEach((field) => {
			if (!enabledFields.includes(field)) return;

			markdown += this.fieldToMarkdown(field) ?? '';
		});

		return markdown.trim();
	}

	private fieldToMarkdown(field: string): string | undefined {
		const value = (this as Record<string, unknown>)[field];
		if (typeof value === 'undefined') return undefined;

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
	
					return `- ${emotes} [${tel}](tel:${tel.replace(/\s/g, '')})\n`
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

	private getSingleValue(property: VCardPropertyValue): string | undefined {
		if (!property) return undefined;
		const singleProperty = Array.isArray(property) ? property[0] : property;
		const value = singleProperty?.valueOf();
		return typeof value === 'string' ? value : undefined;
	}

	private getProperties(property: VCardPropertyValue): VCardProperty[] {
		if (!property) return [];
		return Array.isArray(property) ? property : [property];
	}

	private parseBirthdate(bday: VCardPropertyValue): Date | undefined {
		let birthdate: Date | undefined = undefined;
		
		if (bday) {
			birthdate = new Date(Date.parse(this.getSingleValue(bday) ?? ''));
		}
		return birthdate;
	}

	private parseURLs(URLs: VCardPropertyValue): Array<string> | undefined {
		let links: Array<string> | undefined = undefined;
		
		if (URLs) {
			links = new Array<string>();

			for (let url of this.getProperties(URLs)) {
				links.push(url.valueOf());
			}
		}
		return links;
	}

	private parseNotes(notes: VCardPropertyValue): string | undefined {
		let notesString: string | undefined = undefined;
		
		if (notes) {
			notesString = this.getSingleValue(notes)?.split('\\n').map((line: string) => line.endsWith('\\') ? line.slice(0, line.length-2) : line).join('\n\t');
		}
		return notesString;
	}

	private parseXAbuid(xabuid: VCardPropertyValue): string | undefined {
		let xabuidString: string | undefined = undefined;
		
		if (xabuid) {
			xabuidString = this.getSingleValue(xabuid);
		}
		return xabuidString;
	}

	private parseEmails(email: VCardPropertyValue): Array<string> | undefined {
		let emails: Array<string> | undefined = undefined;
		
		if (email) {
			emails = new Array<string>();
			for (let mail of this.getProperties(email)) {
				emails.push(mail.valueOf());
			}
		}
		return emails;
	}

	private parseAddresses(adr: VCardPropertyValue): Array<[string, string]> | undefined {
		let addresses: Array<[string, string]> | undefined = undefined;
		
		if (adr) {
			addresses = new Array<[string, string]>();
			for (let address of this.getProperties(adr) as VCardPropertyWithType[]) {
				let type = 'home';
				if (typeof address.type == 'string') 
					type = address.type?.toLowerCase() ?? 'home';
				else if (Array.isArray(address.type))
					type = (address.type?.[0]?.toLowerCase() ?? 'home');
				addresses.push([type, address.valueOf()]);
			}
		}
		return addresses;
	}

	private parseTelephones(tel: VCardPropertyValue): Array<[string, string]> | undefined {
		let telephones: Array<[string, string]> | undefined = undefined;
		
		if (tel) {
			telephones = new Array<[string, string]>();
			for (let telephone of this.getProperties(tel) as VCardPropertyWithType[]) {
				let type = (telephone.type?.[0]?.toLowerCase() ?? 'phone') + ',' + (telephone.type?.[1]?.toLowerCase() ?? 'voice');
				telephones.push([type, telephone.valueOf()]);
			}
		}
		return telephones;
	}

	private parseOrganization(org: VCardPropertyValue): string | undefined {
		let organization: string | undefined = undefined;
		
		if (org) {
			organization = this.getSingleValue(org)?.replace(';', ', ').replace(/\\,/g, ',')
		}
		return organization;
	}

	static getVCardFields(): Array<string> {
		const JSON_VCARD: Parameters<typeof vcf.fromJSON>[0] = ["vcard",[["version",{},"text","4.0"], ["fn",{},"text","name"]]];
		const inst = new VCard(vcf.fromJSON(JSON_VCARD));
		return inst.getVCardFields();
	}

	getVCardFields(): Array<string> {
		return Object.getOwnPropertyNames(this)
			.filter(prop => (prop !== 'constructor' && typeof (this as any)[prop] !== 'function') && prop !== 'version' && prop !== 'fn');
	}
}
