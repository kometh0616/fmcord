import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message, Snowflake, TextChannel } from "discord.js";

class SaySubcommand extends Subcommand {

    public constructor() {
        super({
            name: `say`,
            aliases: [`s`]
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (!args[0]) {
            message.reply(`no channel ID specified!`);
            return;
        } else if (!args[1]) {
            message.reply(`no message content specified!`);
            return;
        } else {
            const channelID: Snowflake = args[0];
            const content: string = args.slice(1)
                .join(` `)
                .replace(`"`, `\\"`);
            const scriptlet = `
                (async () => {
                    const channel = this.channels.cache.get('${channelID}');
                    if (channel) {
                        await channel.send("${content}")
                        return true;
                    } else {
                        return false;
                    }
                })()
            `;
            if (client.shard !== null) {
                const sent: boolean[] = await client.shard.broadcastEval(scriptlet);
                if (sent.some(x => x)) {
                    await message.channel.send(`:white_check_mark:`);
                } else {
                    await message.channel.send(`:x:`);
                }
            } else {
                const channel = client.channels.cache.get(channelID);
                const content = args.slice(1).join(` `);
                if (channel !== undefined && channel instanceof TextChannel) {
                    await channel.send(content);
                    await message.channel.send(`:white_check_mark:`);
                } else {
                    await message.channel.send(`:x:`);
                }
            }            
        }
    }

}

module.exports = SaySubcommand;