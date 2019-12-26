import Command from "../handler/Command";
import { Message, RichEmbed, ColorResolvable } from "discord.js";
import FMcord from "../handler/FMcord";
import ReactionInterface from "../classes/ReactionInterface";
import snippets from "../snippets";
import FMcordEmbed from "../classes/FMcordEmbed";

class HelpCommand extends Command {

    public constructor() {
        super({
            name: `help`,
            description: `Shows you this help message. Add a flag \`--manual\` for an ` +
            `interactive manual.`,
            usage: [`help`, `help <command>`, `help --manual`],
            notes: `Interactive manual will only work if a bot has a permission to add ` +
            `reactions to messages.`,
            aliases: [`h`],
            dmAvailable: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const color: ColorResolvable = message.member?.displayColor ?? 16777215;
        const helpCommands: Command[] = client.commands.filter(x => !x.helpExempt);
        if (args[0] === `--manual`) {
            if (message.guild && !message.guild.me.hasPermission(`ADD_REACTIONS`, false, true, true)) {
                await message.reply(`I do not have an \`Add reactions\` permission to execute this command.`);
                return;
            }
            let pages = 0;
            const embeds = helpCommands.map<RichEmbed>(x => {
                const embed = new RichEmbed()
                    .setColor(color)
                    .setTitle(`Command ${x.name}`)
                    .addField(`Description`, x.description)
                    .addField(`Usage`, x.usage.map(u => `${client.prefix}${u}`).join(`, `))
                    .setFooter(`Page ${++pages}/${helpCommands.length} | Command executed by ${message.author.tag}`, message.author.avatarURL)
                    .setTimestamp();
                if (x.notes) {
                    embed.addField(`Notes`, x.notes);
                }
                if (x.aliases && x.aliases.length) {
                    embed.addField(`Aliases`, x.aliases.join(`, `));
                } 
                return embed;
            });
            let index = 0;
            const embed: RichEmbed = embeds[index];
            const msg: Message = await message.channel.send(embed) as Message;
            const ri = new ReactionInterface(client, msg, message.author);
            await ri.setKey(snippets.arrowLeft, () => {
                if (index !== 0) {
                    const embed: RichEmbed = embeds[--index];
                    msg.edit(embed);
                }
            });
            await ri.setKey(snippets.arrowRight, () => {
                if (index !== helpCommands.length - 1) {
                    const embed: RichEmbed = embeds[++index];
                    msg.edit(embed);
                }
            });
            await ri.setKey(snippets.exit, ri.destroy);
        } else if (args.length) {
            const commandName = args[0].toLowerCase();
            const command = client.commands.find(x => x.name === commandName || x.aliases && x.aliases.includes(commandName));
            if (!command) {
                await message.reply(`I couldn't find a command called \`${commandName}\`.`);
                return;
            }
            const embed = new RichEmbed()
                .setColor(color)
                .setTitle(`Command ${command.name}`)
                .addField(`Usage`, command.usage.map(x => `${client.prefix}${x}`).join(`, `))
                .addField(`Description`, command.description)
                .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
                .setTimestamp();
            if (command.notes) {
                embed.addField(`Notes`, command.notes);
            }
            if (command.aliases && command.aliases.length) {
                embed.addField(`Aliases`, command.aliases.join(`, `));
            }
            await message.channel.send(embed);
        } else {
            const commandNames = helpCommands.map<string>(x => `\`${x.name}\``).join(`, `);
            const embed = new FMcordEmbed(message)
                .setTitle(`FMcord's commands`)
                .setThumbnail(client.user.avatarURL)
                .setDescription(`Do \`${client.prefix}help ` +
                `<command name>\` to get more information on a command!`)
                .addField(`Available commands`, commandNames);
            await message.channel.send(embed);
        }
    }

}

module.exports = HelpCommand;