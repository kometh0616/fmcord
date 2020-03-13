import CommandParams from "../handler/CommandParams";
import { Message, TextChannel } from "eris";
import StartTyping from "../hooks/StartTyping";
import { Disables } from "../entities/Disables";
import { In } from "typeorm";
import FMcord from "../handler/FMcord";

export default class EnableCommand extends CommandParams {

    public constructor() {
        super(`enable`, {
            description: `Enables a command if it was previously disabled.`,
            usage: `enable <command>`,
            fullDescription: `This command requires Manage Server permission. Can be overriden ` +
            `if you have Administrator permissions, or if you are an owner of the guild.`,
            requirements: {
                permissions: {
                    manageGuild: true,
                }
            },
            permissionMessage: (message: Message) => `${message.author.mention}, you do not have a \`Manage Guild\` permission to run this command.`,
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, please specify a command you want to enable!`,
            hooks: {
                preCommand: StartTyping
            },
            guildOnly: true
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const name = args[0].toLowerCase();
        const commands = [...Object.values((message.channel.client as FMcord).commands)];
        const isValid = commands.find(x => x.label === name || x.aliases.includes(name));
        if (!isValid) {
            await message.channel.createMessage(`${message.author.mention}, I don't recognise a command \`${name}\`.`);
            return;
        } else if ([`disable`, `enable`].includes(name)) {
            await message.channel.createMessage(`${message.author.mention}, I cannot enable command \`${name}\``);
            return;
        }
        const disabled = await Disables.findOne({
            where: [
                { discordID: message.member!.guild.id, cmdName: name },
                { discordID: message.channel.id, cmdName: name }
            ]
        });
        if (!disabled) {
            await message.channel.createMessage(`${message.author.mention}, command \`${isValid.label}\` wasn't disabled previously.`);
            return;
        }
        if (disabled.discordID === message.channel.id) {
            await Disables.delete({
                discordID: message.channel.id,
                cmdName: name
            });
            await message.channel.createMessage(`${message.author.mention}, command \`${isValid.label}\` enabled in this channel succesfully!`);
        } else {
            const ids = message.member!.guild.channels.filter(x => x instanceof TextChannel)
                .map(x => x.id);
            await Disables.delete({
                discordID: In<string>([...ids, message.member!.guild.id]),
                cmdName: name
            });
            await message.channel.createMessage(`${message.author.mention}, command \`${isValid.label}\` enabled in ${message.member!.guild.name} succesfully!`);
        }
    }

}