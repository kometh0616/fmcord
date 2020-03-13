import CommandParams from "../../handler/CommandParams";
import StartTyping from "../../hooks/StartTyping";
import PostCheck from "../../hooks/PostCheck";
import { Message } from "eris";
import NowPlayingMode from "../../enums/NowPlayingMode";
import UserFetcher from "../../classes/UserFetcher";
import { Modes } from "../../entities/Modes";
import { GuildModes } from "../../entities/GuildModes";
import UsernameAndNotDisabled from "../../checks/UsernameAndNotDisabled";

export default class SetModeSubcommand extends CommandParams {

    public constructor() {
        super(`setmode`, {
            aliases: [`s`],
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, you have not provided a mode! Choose one of the following: \`full\`, \`noprevious\`, \`text\`.`
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        if ([`g`, `guild`].includes(args[0].toLowerCase()) && args[1] === undefined) {
            await message.channel.createMessage(`${message.author.mention}, you have not provided a mode! Choose one of the following: \`full\`, \`noprevious\`, \`text\`.`);
            return;
        }
        const guildIncluded = [`g`, `guild`].includes(args[0].toLowerCase());
        if (guildIncluded && message.member === null) {
            await message.channel.createMessage(`You can only set a guild mode in a... guild.`);
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
            discordID: message.member!.guild.id
        });
        if (modes.has(args[0].toLowerCase())) {
            const settable = (modes.get(modeArg))!;
            if (mode === undefined) {
                const newMode = new Modes();
                newMode.user = user;
                newMode.nowPlayingMode = settable;
                await newMode.save();
            } else {
                mode.nowPlayingMode = settable;
                await mode.save();
            }
            await message.channel.createMessage(`${message.author.mention}, your mode was set to \`${[...modes.keys()].find(x => x.startsWith(modeArg))}\` succesfully!`);
        } else if (guildIncluded) {
            if (!message.member!.permission.has(`manageGuild`)) {
                await message.channel.createMessage(`${message.author.mention}, you must have the \`Manage Guild\` permission to set modes for this guild.`);
                return;
            }
            if (modes.has(modeArg)) {
                const settable = (modes.get(modeArg))!;
                if (guildMode === undefined) {
                    const newMode = new GuildModes();
                    newMode.discordID = message.member!.guild.id;
                    newMode.nowPlayingMode = settable;
                    await newMode.save();
                } else {
                    guildMode.nowPlayingMode = settable;
                    await guildMode.save();
                }
                await message.channel.createMessage(`${message.author.mention}, guild mode was set to \`${[...modes.keys()].find(x => x.startsWith(modeArg))}\` succesfully!`);
            } else {
                await message.channel.createMessage(`${message.author.mention}, you have provided an incorrect mode! Choose one of the following: \`full\`, \`noprevious\`, \`text\`.`);
            }
        } else {
            await message.channel.createMessage(`${message.author.mention}, you have provided an incorrect mode! Choose one of the following: \`full\`, \`noprevious\`, \`text\`.`);
        }
    }

}