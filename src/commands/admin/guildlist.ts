import CommandParams from "../../handler/CommandParams";
import AdminCommandCheck from "../../hooks/AdminCommandCheck";
import OwnerOnly from "../../checks/OwnerOnly";
import { Message } from "eris";
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
        const guildArray = [...message.channel.client.guilds.values()];
        const guildList = guildArray
            .sort((a, b) => b.memberCount - a.memberCount)
            .map(x => `${++num}. ${x.name} with ${x.memberCount} members`).join(`\r\n`);
        await message.channel.createMessage(``, {
            file: guildList,
            name: `guildlist.txt`
        });
    }

}