import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import { Disables } from "../entities/Disables";

class DisableCommand extends Command {

    public constructor() {
        super({
            name: `disable`,
            description: `Disables a command from usage in either an entire guild or ` +
            `a certain channel.`,
            usage: [`disable <command>`, `disable <command> [--guild]`],
            notes: `This command requires Manage Server permission. Can be overriden ` +
            `if you have Administrator permissions, or if you are an owner of the guild.`,
            permissions: {
                user: `MANAGE_GUILD`,
            }
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (!args.length) {
            await message.reply(`please specify a command you want to disable!`);
            return;
        } else {
            const guildFlag: boolean = args[1] === `--guild`;
            const name: string = args[0].toLowerCase();
            const isValid: Command | undefined = client.commands.find(x => x.name === name || x.aliases && x.aliases.includes(name));
            if (!isValid) {
                await message.reply(`I don't recognise a command \`${name}\`.`);
                return;
            } else if ([this.name, `enable`].includes(name)) {
                await message.reply(`I cannot disable a command \`${name}\`.`);
                return;
            }
            const disable: Function = async (): Promise<void> => {
                const disabled = new Disables();
                disabled.discordID = guildFlag ? message.guild.id : message.channel.id;
                disabled.cmdName = name;
                await disabled.save();
                await message.reply(`command \`${isValid.name}\` was succesfully disabled in ${guildFlag ? message.guild.name : `this channel`}!`);
            };
            const isDisabled: Disables | undefined = await Disables.findOne({
                where: [
                    { discordID: message.guild.id },
                    { discordID: message.channel.id }
                ]
            });
            if (isDisabled) {
                let reply = `command \`${isValid.name}\` is already disabled in `;
                if (isDisabled.discordID === message.channel.id) {
                    if (guildFlag) {
                        await disable();
                        return;
                    } else {
                        reply += `this channel.`;
                    }
                } else {
                    reply += `${message.guild.name}.`;
                }
                await message.reply(reply);
            } else {
                await disable();
            }
        }
    }

}

module.exports = DisableCommand;