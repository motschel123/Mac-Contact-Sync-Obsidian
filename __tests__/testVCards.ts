import VCard from "../src/VCard";

const vcf = require("vcf");


const TEST_VCARDS_STRINGS: string[] = [
// Test vCard with all fields
`BEGIN:VCARD
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
END:VCARD`,
// Test vCard with comma in name and company
`BEGIN:VCARD
VERSION:3.0
PRODID:-//Apple Inc.//macOS 14.5//EN
N:Name\, S\,r;Com\,ma\, ;;;
FN:Com\,ma\,  Name\, S\,r
ORG:Comma company\, LLC;
NOTE:test
CATEGORIES:card
UID:5cdf1bd4-fa54-4b8d-94f1-0be1c0d70001
X-ABUID:8657CFA5-A319-42DC-8FFC-76B77A8B0452:ABPerson
END:VCARD`
].map((vcardStr) => vcardStr.replace(/\n/g, "\r\n"));

export const TEST_VCARD_DATA: Map<string, VCard> = new Map(
    TEST_VCARDS_STRINGS.map((vcardStr) => [vcardStr, new VCard(vcf().parse(vcardStr))]));
