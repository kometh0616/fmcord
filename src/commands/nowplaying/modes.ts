import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";
import NowPlayingMode from "../../enums/NowPlayingMode";
import UserFetcher from "../../classes/UserFetcher";
import { Modes } from "../../entities/Modes";
import { GuildModes } from "../../entities/GuildModes";
import FMcordEmbed from "../../classes/FMcordEmbed";

class ModesSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `modes`,
            aliases: [`m`]
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
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
            .addField(`Your mode`, uMode, true);
        if (message.guild !== null) {
            const guildMode = await GuildModes.findOne({
                discordID: message.guild.id
            });
            const gMode = guildMode ? modes.get(guildMode.nowPlayingMode) : `full`;
            embed.addField(`${message.guild.name}'s mode`, gMode, true);
        }
        await message.channel.send(embed);
    }

}

module.exports = ModesSubcommand;