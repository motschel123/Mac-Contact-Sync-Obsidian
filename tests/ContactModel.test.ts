import { ContactModel } from "../src/models/ContactModel";
import { VCardPhotoRegex } from "src/consts";


const LastName = "LastName";
const FirstName = "FirstName";
const MiddleName = "MiddleName";
const Prefix = "Prefix";
const Suffix = "Suffix";
const Nickname = "Nickname";
const MaidenName = "MaidenName";
const PhoneticFirstName = "PhoneticFirstName";
const PhoneticLastName = "PhoneticLastName";
const Company = "Company";
const Department = "Department";
const PhoneticCompany = "PhoneticCompany";
const JobTitle = "JobTitle";
const HomeEmail = "home@email.com";
const WorkEmail = "work@email.com";
const OtherEmail = "other@email.com";
const CellPhone = "01234567890";
const iPhone = "1234567890";

const ADR1_pobox = "";
const ADR1_extended = "";
const ADR1_street = "Street1";
const ADR1_locality = "City1";
const ADR1_region = "Region1";
const ADR1_code = "PostalCode1";
const ADR1_country = "Country1";

const ADR2_pobox = "";
const ADR2_extended = "";
const ADR2_street = "Street2";
const ADR2_locality = "City2";
const ADR2_region = "Region2";
const ADR2_code = "PostalCode2";
const ADR2_country = "Country2";

const Note = "Note Text VCARD Seperator \; \;  \;\;\;\;\; \;\;";

const URL1 = "home.page.com";
const URL2 = "home.com";
const URL3 = "work.com";
const URL4 = "other.com";

const bday = "2000-01-20";

export const testVCardString = `BEGIN:VCARD
VERSION:3.0
PRODID:-//Apple Inc.//macOS 15.6.1//EN
N:${LastName};${FirstName};${MiddleName};${Prefix};${Suffix}
FN:${Prefix} ${FirstName} ${MiddleName} ${LastName} ${Suffix}
NICKNAME:${Nickname}
X-MAIDENNAME:${MaidenName}
X-PHONETIC-FIRST-NAME:${PhoneticFirstName}
X-PHONETIC-LAST-NAME:${PhoneticLastName}
ORG:${Company};${Department}
X-PHONETIC-ORG:${PhoneticCompany}
TITLE:${JobTitle}
EMAIL;type=INTERNET;type=HOME;type=pref:${HomeEmail}
EMAIL;type=INTERNET;type=WORK:${WorkEmail}
item1.EMAIL;type=INTERNET:${OtherEmail}
item1.X-ABLabel:_$!<Other>!$_
TEL;type=CELL;type=VOICE;type=pref:${CellPhone}
TEL;type=IPHONE;type=CELL;type=VOICE:${iPhone}
ADR;type=HOME;type=pref:${ADR1_pobox};${ADR1_extended};${ADR1_street};${ADR1_locality};${ADR1_region};${ADR1_code};${ADR1_country}
ADR;type=WORK:${ADR2_pobox};${ADR2_extended};${ADR2_street};${ADR2_locality};${ADR2_region};${ADR2_code};${ADR2_country}
NOTE:${Note}
item2.URL;type=pref:${URL1}
item2.X-ABLabel:_$!<HomePage>!$_
URL;type=HOME:${URL2}
URL;type=WORK:${URL3}
item3.URL:${URL4}
item3.X-ABLabel:_$!<Other>!$_
BDAY:${bday}
END:VCARD
`;

describe('ContactModel', () => {
    const contact = ContactModel.fromVCardString(testVCardString);

    describe('fromVCardString', () => {
        it("Full Name (vcard:FN)", () => {
            expect(contact).toBeDefined();
            expect(contact.Name).toBe(`${Prefix} ${FirstName} ${MiddleName} ${LastName} ${Suffix}`);
        });

        it("Nickname (vcard:NICKNAME)", () => {
            expect(contact).toBeDefined();
            expect(contact.Nickname).toBe(Nickname);
        });


        it("Prefix (vcard:N)", () => {
            expect(contact).toBeDefined();
            expect(contact.Prefix).toBe(Prefix);
        });


        it("First Name (vcard:N)", () => {
            expect(contact).toBeDefined();
            expect(contact.FirstName).toBe(FirstName);
        });

        it("Middle Name (vcard:N)", () => {
            expect(contact).toBeDefined();
            expect(contact.MiddleName).toBe(MiddleName);
        });

        it("Last Name (vcard:N)", () => {
            expect(contact).toBeDefined();
            expect(contact.LastName).toBe(LastName);
        });

        it("Suffix (vcard:N)", () => {
            expect(contact).toBeDefined();
            expect(contact.Suffix).toBe(Suffix);
        });

        it("Maiden Name (vcard:x-maidenname)", () => {
            expect(contact).toBeDefined();
            expect(contact.MaidenName).toBe(MaidenName);
        });

        it("Phonetic First Name (vcard:X-PHONETIC-FIRST-NAME)", () => {
            expect(contact).toBeDefined();
            expect(contact.PhoneticFirstName).toBe(PhoneticFirstName);
        });

        it("Phonetic Last Name (vcard:X-PHONETIC-LAST-NAME)", () => {
            expect(contact).toBeDefined();
            expect(contact.PhoneticLastName).toBe(PhoneticLastName);
        });

        it("Organization (vcard:ORG)", () => {
            expect(contact).toBeDefined();
            expect(contact.Organization).toBe(Company);
        });
        
        it("Department (vcard:ORG)", () => {
            expect(contact).toBeDefined();
            expect(contact.Department).toBe(Department);
        });

        it("Phonetic Organization (vcard:X-PHONETIC-ORG)", () => {
            expect(contact).toBeDefined();
            expect(contact.PhoneticOrganization).toBe(PhoneticCompany);
        });

        it("Title (vcard:TITLE)", () => {
            expect(contact).toBeDefined();
            expect(contact.Title).toBe(JobTitle);
        });

        it("Emails (vcard:EMAIL)", () => {
            expect(contact).toBeDefined();
            expect(contact.Emails).toContain(HomeEmail);
            expect(contact.Emails).toContain(WorkEmail);
            expect(contact.Emails).toContain(OtherEmail);
        });

        it("Phone Numbers (vcard:TEL)", () => {
            expect(contact).toBeDefined();
            expect(contact.PhoneNumbers).toContain(CellPhone);
            expect(contact.PhoneNumbers).toContain(iPhone);
        });

        it("Addresses (vcard:ADR)", () => {
            expect(contact).toBeDefined();

            expect(contact.Addresses.length).toBe(2);

            expect(contact.Addresses[0]).toContain(ADR1_street);
            expect(contact.Addresses[0]).toContain(ADR1_locality);
            expect(contact.Addresses[0]).toContain(ADR1_region);
            expect(contact.Addresses[0]).toContain(ADR1_code);
            expect(contact.Addresses[0]).toContain(ADR1_country);

            expect(contact.Addresses[1]).toContain(ADR2_pobox);
            expect(contact.Addresses[1]).toContain(ADR2_extended);
            expect(contact.Addresses[1]).toContain(ADR2_street);
            expect(contact.Addresses[1]).toContain(ADR2_locality);
            expect(contact.Addresses[1]).toContain(ADR2_region);
            expect(contact.Addresses[1]).toContain(ADR2_code);
            expect(contact.Addresses[1]).toContain(ADR2_country);
        });

        it("Note (vcard:NOTE)", () => {
            let noteWithoutEscapedSemicolons = Note.replace(/\\;/g, ';');
            expect(contact.Note).toBe(noteWithoutEscapedSemicolons);
        });

        it("URLs (vcard:URL)", () => {
            expect(contact.URLs).toContain(URL1);
            expect(contact.URLs).toContain(URL2);
            expect(contact.URLs).toContain(URL3);
            expect(contact.URLs).toContain(URL4);
        });

        it("Birth Date (vcard:BDAY)", () => {
            expect(contact.BirthDate).toBe("2000-01-20");
        });
    });
}); 