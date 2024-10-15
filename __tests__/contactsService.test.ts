// __tests__/contactsService.test.ts

import { IOsaScriptService } from '../src/services/OsascriptService';
import { IContactsService, ContactsService } from '../src/services/ContactsService';
import { TEST_VCARD_DATA } from './testVCards';

const vcf = require('vcf');

export class MockOsaScriptService implements IOsaScriptService {
    executeScript = jest.fn();
}

describe('Test ContactsService', () => {
    let mockOsaScriptService: MockOsaScriptService;
    let contactsService: IContactsService;

    const groupName = 'testGroup';
    const enabledContactFields = 'nickname,emails,title,organization,telephones,addresses,birthdate,URLs,notes';


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

    test.each(Array.from(TEST_VCARD_DATA))('getVCards: valid response: single vCard', async (vCardStr, vCard) => {
        let testPromise = new Promise((resolve, reject) => {
            resolve(vCardStr);
        });
        
        mockOsaScriptService.executeScript.mockResolvedValue(testPromise);
        const resultPromise = contactsService.getVCards();
        expect(resultPromise).resolves.toEqual([vCard]);
    });

    test('getVCards: valid response: multiple vCards', async () => {
        let testPromise = new Promise((resolve, reject) => {
            resolve(Array.from(TEST_VCARD_DATA).join('\r\n'));
        });
        
        mockOsaScriptService.executeScript.mockResolvedValue(testPromise);
        const resultPromise = contactsService.getVCards();
        expect(resultPromise).resolves.toEqual(Array.from(TEST_VCARD_DATA.values()));
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