import CommandParams from "../../handler/CommandParams";
import StartTyping from "../../hooks/StartTyping";
import PostCheck from "../../hooks/PostCheck";
import { Message } from "eris";
import NowPlayingMode from "../../enums/NowPlayingMode";
import UserFetcher from "../../classes/UserFetcher";
import { Modes } from "../../entities/Modes";
import FMcordEmbed from "../../classes/FMcordEmbed";
import { GuildModes } from "../../entities/GuildModes";
import UsernameAndNotDisabled from "../../checks/UsernameAndNotDisabled";

export default class ModesSubcommand extends CommandParams {

    public constructor() {
        super(`modes`, {
            aliases: [`m`],
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
        });
    }

    public async execute(message: Message): Promise<void> {
        const modes = new Map<NowPlayingMode, string>([
            [NowPlayingMode.FULL, `full`],
            [NowPlayingMode.NO_PREVIOUS, `noprevious`],
            [NowPlayingMode.TEXT_ONLY, `text`]
        ]);
        const userFetcher = new UserFetcher(message);
        const user = await userFetcher.getAuthor();
        const userMode = await Modes.findOne({
            user
        });
        
        const uMode = userMode ? modes.get(userMode.nowPlayingMode) : `full`;
        const embed = new FMcordEmbed(message)
            .setTitle(`User and guild nowplaying modes`)
            .addField(`Your mode`, String(uMode), true);
        if (message.member !== null) {
            const guildMode = await GuildModes.findOne({
                discordID: message.member!.guild.id
            });
            const gMode = guildMode ? modes.get(guildMode.nowPlayingMode) : `full`;
            embed.addField(`${message.member!.guild.name}'s mode`, String(gMode), true);
        }
        await message.channel.createMessage({ embed });
    }

}