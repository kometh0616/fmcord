import { inspect } from "util";
import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";

class EvalSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `eval`,
            aliases: [`e`]
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        try {
            const code: string = args.join(` `);
            let evaled: unknown = eval(code);
            if (typeof evaled !== `string`) {
                evaled = inspect(evaled);
            } 
            await message.channel.send(evaled, {
                code: `js`,
                split: true,
            });
        } catch (e) {
            await message.channel.send(e, {
                code: `xl`,
                split: true
            });
        }
    }

}

module.exports = EvalSubcommand;