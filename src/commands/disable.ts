import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import StartTyping from "../hooks/StartTyping";
import { Disables } from "../entities/Disables";
import FMcord from "../handler/FMcord";

export default class DisableCommand extends CommandParams {

    public constructor() {
        super(`disable`, {
            description: `Disables a command from usage in either an entire guild or ` +
            `a certain channel.`,
            usage: [`disable <command>`, `disable <command> [--guild]`].join(`, `),
            fullDescription: `This command requires Manage Server permission. Can be overriden ` +
            `if you have Administrator permissions, or if you are an owner of the guild.`,
            requirements: {
                permissions: {
                    manageGuild: true,
                }
            },
            permissionMessage: (message: Message) => `${message.author.mention}, you do not have a \`Manage Guild\` permission to run this command.`,
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, please specify a command you want to disable!`,
            hooks: {
                preCommand: StartTyping
            },
            guildOnly: true
        });
    }
    
    public async execute(message: Message, args: string[]): Promise<void> { 
        const guildFlag = args[1] === `--guild`;
        const name = args[0].toLowerCase();
        const commands = [...Object.values((message.channel.client as FMcord).commands)];
        const isValid = commands.find(x => x.label === name || x.aliases.includes(name));
        if (!isValid) {
            await message.channel.createMessage(`${message.author.mention}, I don't recognise a command \`${name}\`.`);
            return;
        } else if ([`disable`, `enable`].includes(name)) {
            await message.channel.createMessage(`${message.author.mention}, I cannot disable a command \`${name}\`.`);
            return;
        }
        const disable = async (): Promise<void> => {
            const disabled = new Disables();
            disabled.discordID = guildFlag ? message.member!.guild.id : message.channel.id;
            disabled.cmdName = name;
            await disabled.save();
            await message.channel.createMessage(`${message.author.mention}, command \`${isValid.label}\` was succesfully disabled in ${guildFlag ? message.member!.guild.name : `this channel`}!`);
        };
        const isDisabled = await Disables.findOne({
            where: [
                { discordID: message.member!.guild.id, cmdName: name },
                { discordID: message.channel.id, cmdName: name }
            ]
        });
        if (isDisabled) {
            let reply = `command \`${isValid.label}\` is already disabled in `;
            if (isDisabled.discordID === message.channel.id) {
                if (guildFlag) {
                    await disable();
                    return;
                } else {
                    reply += `this channel.`;
                }
            } else {
                reply += `${message.member!.guild.name}.`;
            }
            await message.channel.createMessage(`${message.author.mention}, ${reply}`);
        } else {
            await disable();
        }
    }

}