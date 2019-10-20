import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";
import * as path from "path";
import { promises as fs } from "fs";

class GuildListSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `guildlist`,
            aliases: [`g`]
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        let num = 0;
        const dir = path.join(__dirname, `res.txt`);
        const guilds: string[][] = await client.shard.broadcastEval(`
            this.guilds.sort((a, b) => b.memberCount - a.memberCount)
                .map(x => \`\${x.name} with \${x.memberCount} members\`)
        `);
        const list: string = guilds.flat().map(x => `${++num}. ${x}`).join(`\r\n`);
        await fs.writeFile(dir, list);
        await message.channel.send({ files: [{
            attachment: dir,
            name: `guildlist.txt`
        }]});
        await fs.unlink(dir);
    }

}

module.exports = GuildListSubcommand;