import { SyncContactsCmd } from "src/commands/SyncContacts";
import ContactsPlugin from "src/main";

export class CommandHandler {
    constructor(private plugin: ContactsPlugin) {}

    setup(): void {
      this.plugin.addCommand(new SyncContactsCmd(this.plugin));
    }
}