import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";
import UserFetcher from "../../classes/UserFetcher";
import { LastFMUserTopArtists, LastFMTimePeriod, LastFMUser } from "../../lib/lastfm/typings";
import Library from "../../lib/lastfm";
import FMcordEmbed from "../../classes/FMcordEmbed";

class ArtistListSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `artists`,
            aliases: [`a`]
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const lib: Library = new Library(client.apikeys.lastFM);
        let timePeriod: LastFMTimePeriod, embedPeriod: string, length: number;
        let num = 0;
        const userFetcher = new UserFetcher(message);
        const username: string = await userFetcher.username() as string;
        switch (args[0]) {
            case `a`:
            case `alltime`:
            case `o`:
            case `overall`:
                timePeriod = `overall`;
                embedPeriod = `alltime`;
                break;
            case `w`:
            case `weekly`:
                timePeriod = `7day`;
                embedPeriod = `weekly`;
                break;
            case `monthly`:
            case `m`:
                timePeriod = `1month`;
                embedPeriod = `monthly`;
                break;
            case `yearly`:
            case `y`:
                timePeriod = `12month`;
                embedPeriod = `yearly`;
                break;
            default:
                timePeriod = `7day`;
                embedPeriod = `weekly`;
                break;
        }
        length = parseInt(args[1]);
        if (isNaN(length)) {
            length = 10;
        } else if (length > 25) {
            await message.reply(`list size is too big, it must be lower than or 25!`);
            return;
        } else if (length <= 0) {
            await message.reply(`list size is too small, it must be higher than 0!`);
            return;
        }
        const list: LastFMUserTopArtists = await lib.user.getTopArtists(username, {
            period: timePeriod
        });
        const userInfo: LastFMUser = await lib.user.getInfo(username);
        const arr = list.artist.slice(0, length);
        if (!arr.length) {
            await message.reply(`you don't have any ${embedPeriod} artists.`);
            return;
        }
        const embed: FMcordEmbed = new FMcordEmbed(message)
            .setDescription(arr.map(x => `${++num}. **${x.name}** - ${x.playcount} plays`).join(`\n`))
            .setTitle(`${username}'s top ${arr.length} ${embedPeriod} artists`)
            .setURL(userInfo.url);
        await message.channel.send(embed);
    }

}

module.exports = ArtistListSubcommand;