import { App, TAbstractFile, TFile, TFolder, normalizePath } from "obsidian";

export class ContentSeperator {
    readonly startTag: string;
    readonly startText: string;
    readonly endTag: string;
    readonly endText: string;
    readonly commented: boolean;
    readonly commentStart: string;
    readonly commentEnd: string;

    constructor(startTag: string, startText: string, stopTag: string, stopText: string, commented: boolean = true) {
        this.startTag = startTag;
        this.startText = startText;
        this.endTag = stopTag;
        this.endText = stopText;
        this.commented = commented;

        this.commentStart = commented ? '<!--' : '';
        this.commentEnd = commented ? '-->' : '';
    }

    buildContentString(content: string) {
        return `${this.commentStart} ${this.startTag} ${this.startText} ${this.commentEnd} \n${content} \n${this.commentStart} ${this.endTag} ${this.endText} ${this.commentEnd}`;
    
    }
}

export interface IFileService {
    createFolder(folderPath: string, app: App): Promise<void>;
    saveFile(filePath: string, content: string, app: App): Promise<TFile>;
    updateFile(file: TFile, updatedContent: string, seperator: ContentSeperator, app: App): Promise<string>;
}


export class FileService implements IFileService {
    async createFolder(folderPath: string, app: App): Promise<void> {
        if (await app.vault.adapter.exists(normalizePath(folderPath)) == false)
            await app.vault.createFolder(folderPath);
    }

    async saveFile(filePath: string, content: string, app: App,): Promise<TFile> {
        return app.vault.create(filePath, content)
    }

    async updateFile(file: TFile, updatedContent: string, seperator: ContentSeperator, app: App): Promise<string> {
        return app.vault.process(file, (oldContent: string) => {
            let oldLines = oldContent.split("\n");
								
            let startIndex = oldLines.findIndex((line) => line.contains(seperator.startTag));
            let stopIndex = oldLines.findIndex((line) => line.contains(seperator.endTag));

            let newLines = Array<string>();
            for (let i = Math.min(0, startIndex); i < oldLines.length; i++) {
                if (i == startIndex) {
                    newLines.push(updatedContent);
                    i = stopIndex;
                    continue
                }
                newLines.push(oldLines[i]);
            }

            return newLines.join("\n");
        });
    }
}