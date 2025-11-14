export interface ContactModelParams {
    Name: string;
    Nickname: string;
    Prefix: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Suffix: string;
    MaidenName: string;
    PhoneticFirstName: string;
    PhoneticLastName: string;
    Organization: string;
    Department: string;
    PhoneticOrganization: string;
    Title: string;
    Emails: string[];
    PhoneNumbers: string[];
    Addresses: string[];
    Note: string;
    URLs: string[];
    BirthDate: string;
}

export class ContactModel {
    static fields = [
        'Name',
        'Nickname',
        'FirstName',
        'MiddleName',
        'LastName',
        'MaidenName',
        'Title',
        'JobTitle',
        'Department',
        'Organization',
        'Suffix',
        'HomePage',
        'BirthDate',
        'PhoneticFirstName',
        'PhoneticMiddleName',
        'PhoneticLastName',
        'Note',
    ] as const;

    Name: string;
    Nickname: string;
    Prefix: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Suffix: string;
    MaidenName: string;
    PhoneticFirstName: string;
    PhoneticLastName: string;
    Organization: string;
    Department: string;
    PhoneticOrganization: string;
    Title: string;
    Emails: string[];
    PhoneNumbers: string[];
    Addresses: string[];
    Note: string;
    URLs: string[];
    BirthDate: string;

    constructor(params: ContactModelParams) {
        this.Name = params.Name;
        this.Nickname = params.Nickname;
        this.Prefix = params.Prefix;
        this.FirstName = params.FirstName;
        this.MiddleName = params.MiddleName;
        this.LastName = params.LastName;
        this.Suffix = params.Suffix;
        this.MaidenName = params.MaidenName;
        this.PhoneticFirstName = params.PhoneticFirstName;
        this.PhoneticLastName = params.PhoneticLastName;
        this.Organization = params.Organization;
        this.Department = params.Department;
        this.PhoneticOrganization = params.PhoneticOrganization;
        this.Title = params.Title;
        this.Emails = params.Emails;
        this.PhoneNumbers = params.PhoneNumbers;
        this.Addresses = params.Addresses;
        this.Note = params.Note;
        this.URLs = params.URLs;
        this.BirthDate = params.BirthDate;
    }

    static fromVCardString(vCardStr: string): ContactModel {
        let [LastName, FirstName, MiddleName, Prefix, Suffix] = vCardStr.match(/^N:([^;]*);([^;]*);([^;]*);([^;]*);([^;\n\R]*)$/m)?.slice(1, 6) ?? ['', '', '', '', ''];
        let [Organization, Department] = vCardStr.match(/^ORG:([^;]*);([^;\n\R]*)$/m)?.slice(1, 3) ?? ['', ''];

        let Emails = Array.from(vCardStr.matchAll(/^.*?EMAIL([^:]*):(?<email>.*)$/mg))
            .map(match => match.groups?.email ?? '');
        let PhoneNumbers = Array.from(vCardStr.matchAll(/^TEL([^:]*):(?<phone>.*)$/mg))
            .map(match => match.groups?.phone ?? '');
        let Addresses = Array.from(vCardStr.matchAll(/^ADR(?<type>[^:]*?):(?<pobox>[^;]*?);(?<extended>[^;]*?);(?<street>[^;]*?);(?<locality>[^;]*?);(?<region>[^;]*?);(?<code>[^;]*?);(?<country>[^;]*?)$/mg))
            .map(match => `${match.groups?.street}, ${match.groups?.code} ${match.groups?.locality}, ${match.groups?.region} ${match.groups?.country}`)
            .map(adr => adr.replace(/\n,/g, '').replace(/  /g, ' ').trim());
        let URLs = Array.from(vCardStr.matchAll(/^.*?URL([^:]*):(?<url>.*)$/mg))
            .map(match => match.groups?.url ?? '');

        let Note = (vCardStr.match(/^NOTE:(.*)$/m)?.[1] ?? '').replace(/\\;/g, ';').replace(/\\n/g, '\n');
        
        return new ContactModel({
            Name: vCardStr.match(/^FN:(.*)$/m)?.[1] ?? '',
            Nickname: vCardStr.match(/^NICKNAME:(.*)$/m)?.[1] ?? '',
            Prefix: Prefix,
            FirstName: FirstName,
            MiddleName: MiddleName,
            LastName: LastName,
            Suffix: Suffix,
            MaidenName: vCardStr.match(/^X-MAIDENNAME:(.*)$/m)?.[1] ?? '',
            PhoneticFirstName: vCardStr.match(/^X-PHONETIC-FIRST-NAME:(.*)$/m)?.[1] ?? '',
            PhoneticLastName: vCardStr.match(/^X-PHONETIC-LAST-NAME:(.*)$/m)?.[1] ?? '',
            Organization: Organization,
            Department: Department,
            PhoneticOrganization: vCardStr.match(/^X-PHONETIC-ORG:(.*)$/m)?.[1] ?? '',
            Title: vCardStr.match(/^TITLE:(.*)$/m)?.[1] ?? '',
            Emails: Emails,
            PhoneNumbers: PhoneNumbers,
            Addresses: Addresses,
            Note: Note,
            URLs: URLs,
            BirthDate: vCardStr.match(/^BDAY:(.*)$/m)?.[1] ?? '',
        } as ContactModelParams);
    }
}

