import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message, Member } from "eris";
import Library from "../lib/lastfm";
import FMcord from "../handler/FMcord";
import { Users } from "../entities/Users";
import RandomArray from "../classes/RandomArray";
import { LastFMTopTrack } from "../lib/lastfm/typings";
import FMcordEmbed from "../classes/FMcordEmbed";
import snippets from "../snippets";
import PostCheck from "../hooks/PostCheck";
import NotDisabled from "../checks/NotDisabled";

interface UserCredentials {
    discord: Member;
    lastFM: string;
}

export default class ImLuckyCommand extends CommandParams {

    public constructor() {
        super(`imlucky`, {
            description: `Gets a random song from a random user's top 15 songs.`,
            usage: `imlucky`,
            aliases: [`i`],
            requirements: {
                custom: NotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
            guildOnly: true
        });
    }

    public async execute(message: Message): Promise<void> {
        const lib = new Library((message.channel.client as FMcord).apikeys.lastFM);
        const users = await Users.find({
            where: [
                ...message.member!.guild.members.map(x => ({ discordUserID: x.id }))
            ]
        });
        if (!users.length) {
            await message.channel.createMessage(`${message.author.mention}, no one has their Last.fm nicknames set in this server.`);
            return;
        }
        const names = new RandomArray<UserCredentials>(...users.map(x => ({
            discord: message.member!.guild.members.get(x.discordUserID)!,
            lastFM: x.lastFMUsername
        })));
        const randomUser = names.random;
        const userURL = `https://last.fm/user/${randomUser.lastFM}`;
        const topTracks = await lib.user.getTopTracks(randomUser.lastFM, {
            period: `overall`,
            limit: `15`
        });
        const tracks = new RandomArray<LastFMTopTrack>(...topTracks.track);
        const track = tracks.random;
        const trackInfo = await lib.track.getInfo(track.artist.name, track.name);
        const embed = new FMcordEmbed(message)
            .setTitle(`Random song from ${randomUser.lastFM} (${randomUser.discord.user.username})`)
            .setURL(userURL)
            .addField(`Artist`, snippets.clickify(track.artist.name, track.artist.url), true)
            .addField(`Track`, snippets.clickify(track.name, track.url), true)
            .setThumbnail(randomUser.discord.user.avatarURL);
        if (trackInfo.album) {
            embed.addField(`Album`, snippets.clickify(trackInfo.album.title, trackInfo.album.url), true);
            if (trackInfo.album.image.length > 0) {
                embed.setThumbnail(trackInfo.album.image[1][`#text`]);
            }
        }
        embed.addField(`Listens by ${randomUser.lastFM}`, track.playcount, true);
        if (trackInfo.toptags.tag.length > 0) {
            embed.addField(`Tags`, trackInfo.toptags.tag.map(x => snippets.clickify(x.name, x.url)).join(` - `));
        }
        await message.channel.createMessage({ embed });
    }

}