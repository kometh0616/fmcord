import Command from "../handler/Command";
import { Message } from "discord.js";
import FMcord from "../handler/FMcord";
import { Disables } from "../entities/Disables";
import { In } from "typeorm";

class EnableCommand extends Command {

    public constructor() {
        super({
            name: `enable`,
            description: `Enables a command if it was previously disabled.`,
            usage: [`enable <command>`],
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
        }
        const name: string = args[0].toLowerCase();
        const isValid: Command | undefined = client.commands.find(x => x.name === name || x.aliases && x.aliases.includes(name));
        if (!isValid) {
            await message.reply(`I don't recognise a command \`${name}\`.`);
            return;
        } else if ([this.name, `disable`].includes(name)) {
            await message.reply(`I cannot enable command \`${name}\``);
            return;
        }
        const disabled: Disables | undefined = await Disables.findOne({
            where: [
                { discordID: message.guild.id, cmdName: name },
                { discordID: message.channel.id, cmdName: name }
            ]
        });
        if (!disabled) {
            await message.reply(`command \`${isValid.name}\` wasn't disabled previously.`);
            return;
        }
        if (disabled.discordID === message.channel.id) {
            await Disables.delete({
                discordID: message.channel.id,
                cmdName: name
            });
            await message.reply(`command \`${isValid.name}\` enabled in this channel succesfully!`);
        } else {
            const ids = message.guild.channels.filter(x => x.type === `text`)
                .map(x => x.id);
            await Disables.delete({
                discordID: In<string>([...ids, message.guild.id]),
                cmdName: name
            });
            await message.reply(`command \`${isValid.name}\` enabled in ${message.guild.name} succesfully!`);
        }
    }

}

module.exports = EnableCommand;