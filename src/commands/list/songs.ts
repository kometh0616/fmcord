import CommandParams from "../../handler/CommandParams";
import StartTyping from "../../hooks/StartTyping";
import PostCheck from "../../hooks/PostCheck";
import { Message } from "eris";
import FMcord from "../../handler/FMcord";
import Library from "../../lib/lastfm";
import { LastFMTimePeriod } from "../../lib/lastfm/typings";
import UserFetcher from "../../classes/UserFetcher";
import DiscordUserGetter from "../../utils/DiscordUserGetter";
import snippets from "../../snippets";
import FMcordEmbed from "../../classes/FMcordEmbed";
import UsernameAndNotDisabled from "../../checks/UsernameAndNotDisabled";

export default class SongsSubcommand extends CommandParams {

    public constructor() {
        super(`songs`, {
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
            requirements: {
                custom: UsernameAndNotDisabled
            },
            aliases: [`s`],
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const lib = new Library(client.apikeys.lastFM);
        let timePeriod: LastFMTimePeriod, embedPeriod: string, length: number, userID: string = message.author.id;
        let num = 0;
        const userFetcher = new UserFetcher(message);
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
            await message.channel.createMessage(`${message.author.mention}, list size is too big, it must be lower than or 25!`);
            return;
        } else if (length <= 0) {
            await message.channel.createMessage(`${message.author.mention}, list size is too small, it must be higher than 0!`);
            return;
        }
        if (args.length > 2) {
            const member = DiscordUserGetter(message, args.slice(2).join(` `));
            if (member !== null) {
                userID = member.id;
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
                return;
            }
        }
        const username = await userFetcher.usernameFromID(userID);
        if (username !== null) {
            const list = await lib.user.getTopTracks(username, {
                period: timePeriod
            });
            const userInfo = await lib.user.getInfo(username);
            const arr = list.track.slice(0, length);
            if (!arr.length) {
                const author = userID === message.author.id;
                await message.channel.createMessage(`${message.author.mention}, ${author ? `you` : username} do${author ? `` : `es`}n't have any ${embedPeriod} artists.`);
                return;
            }
            const embed = new FMcordEmbed(message)
                .setDescription(arr.map(x => `${++num}. **${x.name}** by **${x.artist.name}** with ${x.playcount} plays`).join(`\n`))
                .setTitle(`${username}'s top ${arr.length} ${embedPeriod} artists`)
                .setURL(userInfo.url);
            await message.channel.createMessage({ embed });
        } else {
            await message.channel.createMessage(`${message.author.mention}, ${snippets.userNoLogin}`);
        }
    }

}