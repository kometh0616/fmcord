import CommandParams from "../../handler/CommandParams";
import AdminCommandCheck from "../../hooks/AdminCommandCheck";
import OwnerOnly from "../../checks/OwnerOnly";
import { Message } from "eris";
import * as path from "path";
import { promises as fs } from "fs";
import StartTyping from "../../hooks/StartTyping";

export default class GuildListSubcommand extends CommandParams {

    public constructor() {
        super(`guildlist`, {
            aliases: [`g`],
            requirements: {
                userIDs: OwnerOnly,
            },
            hooks: {
                postCheck: AdminCommandCheck,
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message): Promise<void> {
        let num = 0;
        const dir = path.join(__dirname, `res.txt`);
        const guilds = message.channel.client.guilds.map(x => `${++num}. ${x.name} with ${x.memberCount} members`).join(`\r\n`);
        await fs.writeFile(dir, guilds);
        await message.channel.createMessage(``, {
            file: dir,
            name: `guildlist.txt`
        });
        await fs.unlink(dir);
    }

}