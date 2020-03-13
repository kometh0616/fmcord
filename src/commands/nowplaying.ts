import CommandParams from "../handler/CommandParams";
import PostCheck from "../hooks/PostCheck";
import StartTyping from "../hooks/StartTyping";
import { Message, Member } from "eris";
import Library from "../lib/lastfm";
import TrackFetcher from "../classes/TrackFetcher";
import NowPlayingMode from "../enums/NowPlayingMode";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import snippets from "../snippets";
import FMcordEmbed from "../classes/FMcordEmbed";
import FMcord from "../handler/FMcord";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";

export default class NowPlayingCommand extends CommandParams {

    public constructor() {
        super(`nowplaying`, {
            description: `Shows you a song you are listening to right now, or changes your \`nowplaying\` mode for your account/server.`,
            usage: [`nowplaying`, `nowplaying modes`, `nowplaying setmode <mode>`, `nowplaying setmode guild <mode>`].join(`, `),
            fullDescription: `You must have a \`Manage Guild\` permission in order to set modes for your server.\n` +
            `Available modes are \`full\`, \`noprevious\` and \`text\`.\n` +
            `Full mode is the default one, shows you your current track, your previous track and your scrobbles in an embed format.\n` +
            `Noprevious mode is full mode but without a previous track.\n` +
            `Text mode only tells you your current track in a message format.\n`+
            `You can use the first letter of a subcommand/mode as a shortcut.\n` +
            `The less information a mode shows, the stricter it is, meaning that, for example, if you set your guild mode to \`full\`, ` +
            `people will be able to use other modes, but if you set it to \`text\`, people will only be able to use that.`,
            aliases: [`np`, `current`],
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                postCheck: PostCheck,
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const lib = new Library(client.apikeys.lastFM);
        const trackFetcher = new TrackFetcher(client, message);
        let username: string | null;
        let user: Member | null = null;
        const mode: NowPlayingMode = await trackFetcher.mode() ?? NowPlayingMode.FULL;
        if (args.length) {
            user = DiscordUserGetter(message, args.join(` `));
            if (user) {
                username = await trackFetcher.usernameFromID(user.id);
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
                return;
            }
        } else {
            username = await trackFetcher.username();
        }
        if (username !== null) {
            const currentTrack = await trackFetcher.getCurrentTrack(username);
            if (currentTrack) {
                const lastTrack = await trackFetcher.getLatestTrack(username);
                const userData = await lib.user.getInfo(username);
                const currentAlbum = currentTrack.album[`#text`] || `no album`;
                const lastAlbum = lastTrack!.album[`#text`] || `no album`;
                if (mode !== NowPlayingMode.TEXT_ONLY) {
                    const embed = new FMcordEmbed(message)
                        .addField(`Current`, `**${currentTrack.name}** - ${currentTrack.artist[`#text`]} | ${currentAlbum}`);
                    if (mode !== NowPlayingMode.NO_PREVIOUS) {
                        embed.addField(`Previous`, `**${lastTrack!.name}** - ${lastTrack!.artist[`#text`]} | ${lastAlbum}`);
                    }
                    embed
                        .setTitle(`Current track for ${userData.name} (${user?.user.username ?? message.author.username})`)
                        .setURL(userData.url)
                        .setThumbnail(currentTrack.image[2][`#text`]);
                    const authorAvatar = message.author.avatarURL;
                    if (authorAvatar !== null) {
                        embed.setFooter(`${userData.name} has ${userData.playcount} scrobbles.`, authorAvatar);
                    } else {
                        embed.setFooter(`${userData.name} has ${userData.playcount} scrobbles.`);
                    }
                    await message.channel.createMessage({ embed });
                } else {
                    const reply = `current: **${currentTrack.name}** - ${currentTrack.artist[`#text`]} | ${currentAlbum}\n${userData.name} | ${userData.playcount} scrobbles`;
                    await message.channel.createMessage(`${message.author.mention}, ${reply}`);
                }
            } else if (args.length > 0) {
                await message.channel.createMessage(`${message.author.mention}, the target user is not listening to anything right now.`);
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
            }
        } else if (args.length) {
            await message.channel.createMessage(`${message.author.mention}, ${snippets.userNoLogin}`);
        }
    }

}