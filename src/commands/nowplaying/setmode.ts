import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";
import UserFetcher from "../../classes/UserFetcher";
import { Modes } from "../../entities/Modes";
import NowPlayingMode from "../../enums/NowPlayingMode";
import { GuildModes } from "../../entities/GuildModes";

class SetModeSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `setmode`,
            aliases: [`s`],
        });
    }
    
    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (args[0] === undefined || [`g`, `guild`].includes(args[0].toLowerCase()) && args[1] === undefined) {
            await message.reply(`you have not provided a mode! Choose one of the following: \`full\`, \`noprevious\`, \`text\`.`);
            return;
        }
        const guildIncluded = [`g`, `guild`].includes(args[0].toLowerCase());
        if (guildIncluded && message.guild === null) {
            await message.channel.send(`You can only set a guild mode in a... guild.`);
        }
        const modeArg = guildIncluded ? args[1].toLowerCase() : args[0].toLowerCase();
        const modes = new Map<string, NowPlayingMode>([
            [`full`, NowPlayingMode.FULL],
            [`f`, NowPlayingMode.FULL],
            [`noprevious`, NowPlayingMode.NO_PREVIOUS],
            [`n`, NowPlayingMode.NO_PREVIOUS],
            [`text`, NowPlayingMode.TEXT_ONLY],
            [`t`, NowPlayingMode.TEXT_ONLY]
        ]);
        const userFetcher = new UserFetcher(message);
        const user = (await userFetcher.getAuthor())!;
        const mode = await Modes.findOne({
            user
        });
        const guildMode = await GuildModes.findOne({
            discordID: message.guild!.id
        });
        if (modes.has(args[0].toLowerCase())) {
            const settable = (modes.get(modeArg))!;
            if (mode === undefined) {
                const newMode = new Modes();
                newMode.nowPlayingMode = settable;
                await newMode.save();
            } else {
                mode.nowPlayingMode = settable;
                await mode.save();
            }
            await message.reply(`your mode was set to \`${[...modes.keys()].find(x => x.startsWith(modeArg))}\` succesfully!`);
        } else if (guildIncluded) {
            if (!message.member!.hasPermission(`MANAGE_GUILD`, { checkAdmin: true, checkOwner: true })) {
                await message.reply(`you must have the \`Manage Guild\` permission to set modes for this guild.`);
                return;
            }
            if (modes.has(modeArg)) {
                const settable = (modes.get(modeArg))!;
                if (guildMode === undefined) {
                    const newMode = new GuildModes();
                    newMode.discordID = message.guild!.id;
                    newMode.nowPlayingMode = settable;
                    await newMode.save();
                } else {
                    guildMode.nowPlayingMode = settable;
                    await guildMode.save();
                }
                await message.reply(`guild mode was set to \`${[...modes.keys()].find(x => x.startsWith(modeArg))}\` succesfully!`);
            } else {
                await message.reply(`you have provided an incorrect mode! Choose one of the following: \`full\`, \`noprevious\`, \`text\`.`);
            }
        } else {
            await message.reply(`you have provided an incorrect mode! Choose one of the following: \`full\`, \`noprevious\`, \`text\`.`);
        }
    }

}

module.exports = SetModeSubcommand;