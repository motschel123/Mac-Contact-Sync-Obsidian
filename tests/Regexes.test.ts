import { ContactFileReplaceRegex, KEEP_CONTENT_SEPARATOR, PlaceholderMatchingRegex, VCardPhotoRegex } from "../src/consts";

const testContactContent_NoKeepSeparator = `---
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

const testContactContent_WithKeepSeparator = `---
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
{{Note}}
${KEEP_CONTENT_SEPARATOR}
This content should be kept.
`;

describe("RegExp", () => {
    describe("ContactFileReplaceRegex", () => {
        const regexToTest = ContactFileReplaceRegex();
        it("should match all file content if no KEEP_SEPARATOR is present", () => {
            const matches = testContactContent_NoKeepSeparator.match(regexToTest);
            expect(matches).toBeDefined();
            expect(matches![0]).toEqual(testContactContent_NoKeepSeparator);
        });

        it("should match content up to KEEP_SEPARATOR if present", () => {
            let matches = testContactContent_WithKeepSeparator.match(regexToTest);
            expect(matches).toBeDefined();
            expect(matches![0]).toEqual(testContactContent_WithKeepSeparator.split(KEEP_CONTENT_SEPARATOR)[0]);
        });
    });

    describe("PlaceholderMatching", () => {
        const regexToTest = PlaceholderMatchingRegex;

        // TDOO: Add tests for PlaceholderMatching regex
    });

    describe("VCardPhotoRegex", () => {
        const regexToTest = VCardPhotoRegex;

        // TODO: Add tests for VCardPhotoRegex
    });
});
