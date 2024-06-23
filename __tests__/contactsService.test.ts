// __tests__/contactsService.test.ts

import { IOsaScriptService } from '../src/osascriptService';
import { IContactsService, ContactsService } from '../src/contactsService';
import VCard from '../src/vcard';

const vcf = require('vcf');

export class MockOsaScriptService implements IOsaScriptService {
    executeScript = jest.fn();
}

describe('Test ContactsService', () => {
    let mockOsaScriptService: MockOsaScriptService;
    let contactsService: IContactsService;

    const groupName = 'testGroup';
    const enabledContactFields = 'nickname,emails,title,organization,telephones,addresses,birthdate,URLs,notes';

    const testVCardStr = `BEGIN:VCARD
VERSION:3.0
PRODID:-//Apple Inc.//macOS 14.5//EN
N:Last;First;Middle;Prefix;
FN:Prefix First Middle Last
NICKNAME:Nickname
ORG:Company;Department
TITLE:Job Title
EMAIL;type=INTERNET;type=HOME;type=pref:home@email.com
EMAIL;type=INTERNET;type=WORK:work@email.com
TEL;type=CELL;type=VOICE;type=pref:0123456789
TEL;type=HOME;type=VOICE:1234567890
ADR;type=HOME;type=pref:;;Street;City;;11111;Germany
ADR;type=WORK:;;Work;ca;;1111;dfdfdf
NOTE:Test card
item1.URL;type=pref:homepage.com
item1.X-ABLabel:_$!<HomePage>!$_
URL;type=WORK:workpage.com
BDAY:2000-01-20
CATEGORIES:card
UID:f2f79d22-d2a9-4f01-b5c5-e51bc965bfe1
X-ABUID:54C90A41-2527-4E73-A54A-3295F84B2D3C:ABPerson
END:VCARD`.replace(/\r?\n/g, "\r\n");
    const testVCard = new VCard(vcf.parse(testVCardStr)[0]);

    beforeEach(() => {
        mockOsaScriptService = new MockOsaScriptService();
        contactsService = new ContactsService(groupName, enabledContactFields, mockOsaScriptService);
    });

    test('ContactsService initializes correctly', () => {
        expect(contactsService).toBeDefined();
    });

    test('getNumberOfContactsInGroup: valid response', async () => {
        let testPromise = new Promise((resolve, reject) => {
            resolve('3');
        });

        mockOsaScriptService.executeScript.mockResolvedValue(testPromise);
        const result = await contactsService.getNumberOfContacts();
        expect(result).toBe(3);
    });

    test('getNumberOfContactsInGroup: non-numeric reponse', async () => {
    let testPromise = new Promise((resolve, reject) => {
            resolve('abc');
        });

        mockOsaScriptService.executeScript.mockResolvedValue(testPromise);
        const resultPromise = contactsService.getNumberOfContacts();

        expect(resultPromise).rejects.toThrow();
    });

    test('getNumberOfContactsInGroup: error reponse', async () => {
        let testPromise = new Promise((resolve, reject) => {
            reject(new Error('dummy error'));
        });

        mockOsaScriptService.executeScript.mockResolvedValue(testPromise);
        const resultPromise = contactsService.getNumberOfContacts();

        expect(resultPromise).rejects.toThrow()
    });

    test('getVCards: valid response', async () => {
        let testPromise = new Promise((resolve, reject) => {
            resolve(testVCardStr + "\r\n" + testVCardStr);
        });
        
        mockOsaScriptService.executeScript.mockResolvedValue(testPromise);
        const resultPromise = contactsService.getVCards();
        expect(resultPromise).resolves.toEqual([testVCard, testVCard]);
    });

    test('getVCards: error response', async () => {
        let testPromise = new Promise((resolve, reject) => {
            reject(new Error('dummy error'));
        });
        
        mockOsaScriptService.executeScript.mockResolvedValue(testPromise);
        const resultPromise = contactsService.getVCards();
        expect(resultPromise).rejects.toThrow();
    });
});