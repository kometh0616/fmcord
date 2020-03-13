import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import Library from "../lib/lastfm";
import FMcord from "../handler/FMcord";
import snippets from "../snippets";
import FMcordEmbed from "../classes/FMcordEmbed";
import PostCheck from "../hooks/PostCheck";
import NotDisabled from "../checks/NotDisabled";

export default class GenreInfoCommand extends CommandParams {

    public constructor() {
        super(`genreinfo`, {
            description: `Returns general information about a defined genre.`,
            usage: `genreinfo <music genre>`,
            aliases: [`g`, `gi`, `genre`],
            requirements: {
                custom: NotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, you haven't specified a genre!`
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const lib = new Library((message.channel.client as FMcord).apikeys.lastFM);
        const genre = args.join(` `);
        const data = await lib.tag.getInfo(genre);
        const content = data.wiki.content.replace(snippets.hrefRegex, ``);
        const embed = new FMcordEmbed(message)
            .setTitle(`Information about ${data.name}`)
            .addField(`Total uses of the genre`, String(data.total))
            .addField(`Genre listeners`, String(data.reach));
        if (/ +/gi.test(content)) {
            embed.addField(`Information`, snippets.truncate(content));
        }
        await message.channel.createMessage({ embed });
    }

}