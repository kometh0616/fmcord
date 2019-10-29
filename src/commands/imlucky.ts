import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message, GuildMember } from "discord.js";
import Library from "../lib/lastfm";
import { Users } from "../entities/Users";
import RandomArray from "../classes/RandomArray";
import { LastFMTopTrack } from "../lib/lastfm/typings";
import FMcordEmbed from "../classes/FMcordEmbed";
import snippets from "../snippets";

interface UserCredentials {
    discord: GuildMember;
    lastFM: string;
}

class ImLuckyCommand extends Command {
    
    public constructor() {
        super({
            name: `imlucky`,
            description: `Gets a random song from a random user's top 15 songs.`,
            usage: [`imlucky`],
            aliases: [`i`],
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        const lib = new Library(client.apikeys.lastFM);
        const users: Users[] = await Users.find({
            where: [
                ...message.guild.members.map(x => ({ discordUserID: x.id }))
            ]
        });
        if (!users.length) {
            await message.reply(`no one has their Last.fm nicknames set in this server.`);
            return;
        }
        
        const names = new RandomArray<UserCredentials>(...users.map(x => ({
            discord: message.guild.members.get(x.discordUserID)!,
            lastFM: x.lastFMUsername
        })));
        const username: UserCredentials = names.random;
        const userURL = `https://last.fm/user/${username.lastFM}`;
        const topTracks = await lib.user.getTopTracks(username.lastFM, {
            period: `overall`,
            limit: `15`
        });
        const tracks = new RandomArray<LastFMTopTrack>(...topTracks.track);
        const track = tracks.random;
        const trackInfo = await lib.track.getInfo(track.artist.name, track.name);
        const embed = new FMcordEmbed(message)
            .setTitle(`Random song from ${username.lastFM} (${username.discord.user.username})`)
            .setURL(userURL)
            .addField(`Artist`, `[${track.artist.name}](${snippets.removeParens(track.artist.url)})`, true)
            .addField(`Track`, `[${track.name}](${snippets.removeParens(track.url)})`, true)
            .setThumbnail(username.discord.user.avatarURL);
        if (trackInfo.album) {
            embed.addField(`Album`, `[${trackInfo.album.title}](${snippets.removeParens(trackInfo.album.url)})`, true);
            if (trackInfo.album.image.length) {
                embed.setThumbnail(trackInfo.album.image[1][`#text`]);
            } else {
                embed.setThumbnail(username.discord.user.avatarURL);
            }
        }
        embed.addField(`Listens by ${username.lastFM}`, track.playcount, true);
        if (trackInfo.toptags.tag.length) {
            embed.addField(`Tags`, trackInfo.toptags.tag.map(x => `[${x.name}](${snippets.removeParens(x.url)})`).join(` - `), true);
        }
        await message.channel.send(embed);
    }

}

module.exports = ImLuckyCommand;