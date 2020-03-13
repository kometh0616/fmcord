/* eslint-disable @typescript-eslint/require-await */
import CommandParams from "../../handler/CommandParams";
import { Message, MessageContent } from "eris";
import StartTyping from "../../hooks/StartTyping";
import snippets from "../../snippets";
import FMcord from "../../handler/FMcord";
import CommandEmbed from "../../classes/CommandEmbed";
import NotDisabled from "../../checks/NotDisabled";
import { Disables } from "../../entities/Disables";

export default class ManualSubcommand extends CommandParams {

    public constructor() {
        super(`--manual`, {
            requirements: {
                async custom(message: Message): Promise<boolean> {
                    if (message.member !== null) {
                        const me = message.member!.guild.members.get(message.channel.client.user.id)!;
                        return (me.permission.has(`addReactions`) || me.permission.has(`administrator`)) && await NotDisabled(message);
                    } else {
                        return true;
                    }
                }
            },
            hooks: {
                preCommand: StartTyping,
                async postCheck(message: Message, args: string[], checkPassed: boolean): Promise<void> {
                    if (!checkPassed) {
                        const me = message.member!.guild.members.get(message.channel.client.user.id)!;
                        if (!(me.permission.has(`addReactions`) || me.permission.has(`administrator`))) {
                            await message.channel.createMessage(`I do not have an \`Add reactions\` permission to execute this command.`);
                        } else {
                            const isDisabled = await Disables.findOne({
                                where: [
                                    { discordID: message.channel.id, cmdName: message.command?.label },
                                    { discordID: message.guildID, cmdName: message.command?.label }
                                ]
                            });
                            if (isDisabled !== undefined) {
                                const guildDisabled = isDisabled.discordID === message.guildID;
                                await message.channel.createMessage(`${message.author.mention}, command \`${message.command?.label}\` is disabled in ${guildDisabled ? message.member!.guild.name : `this channel`}`);
                            }
                        }
                        return;
                    }
                }
            },
            reactionButtons: [{
                emoji: snippets.arrowLeft,
                type: `edit`,
                response: (message: Message): void => {
                    const previousCommand = message.embeds[0].title?.slice(`Command `.length);
                    const commands = [...Object.values((message.channel.client as FMcord).commands)]
                        .filter(x => !x.hidden);
                    const cmdIndex = commands.findIndex(x => x.label === previousCommand) - 1;
                    if (cmdIndex !== -1) {
                        const embed = new CommandEmbed(message, commands[cmdIndex]);
                        message.edit({ embed });
                    } else {
                        message.edit({ embed: message.embeds[0] });
                    }
                }
            }, {
                emoji: snippets.arrowRight,
                type: `edit`,
                response: (message: Message): void => {
                    const previousCommand = message.embeds[0].title?.slice(`Command `.length);
                    const commands = [...Object.values((message.channel.client as FMcord).commands)]
                        .filter(x => !x.hidden);
                    const cmdIndex = commands.findIndex(x => x.label === previousCommand) + 1;
                    if (cmdIndex !== commands.length) {
                        const embed = new CommandEmbed(message, commands[cmdIndex]);
                        message.edit({ embed });
                    } else {
                        message.edit({ embed: message.embeds[0] });
                    }
                }
            }, {
                emoji: snippets.exit,
                type: `cancel`,
                response: (): void => {
                    return;
                }
            }],
            reactionButtonTimeout: 600000
        });
    }

    public async execute(message: Message): Promise<MessageContent> {
        const command = [...Object.values((message.channel.client as FMcord).commands)][0];
        const color = message.member?.guild.members.get(message.channel.client.user.id)?.roles
            .map(id => message.member!.guild.roles.get(id)!)
            .sort((a, b) => b.position - a.position)
            .find(r => r.color !== 0)?.color ?? 16777215;
        const embed = new CommandEmbed(message, command)
            .setColor(color);
        return { embed };
    }

}