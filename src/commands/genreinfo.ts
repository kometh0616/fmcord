import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import { LastFMTagInfo } from "../lib/lastfm/typings";
import Library from "../lib/lastfm";
import snippets from "../snippets";
import FMcordEmbed from "../classes/FMcordEmbed";

class GenreInfoCommand extends Command {

    public constructor() {
        super({
            name: `genreinfo`,
            description: `Returns general information about a defined genre.`,
            usage: [`genreinfo <music genre>`],
            aliases: [`g`, `gi`, `genre`],
            dmAvailable: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (!args.length) {
            await message.reply(`you haven't specified a genre!`);
            return;
        }
        const lib = new Library(client.apikeys.lastFM);
        const genre: string = args.join(` `);
        const data: LastFMTagInfo = await lib.tag.getInfo(genre);
        const content: string = data.wiki.content.replace(snippets.hrefRegex, ``);
        const embed = new FMcordEmbed(message)
            .setTitle(`Information about ${data.name}`)
            .addField(`Total uses of the genre`, data.total)
            .addField(`Genre listeners`, data.reach);
        if (/ +/gi.test(content)) {
            embed.addField(`Information`, snippets.truncate(content));
        }
        await message.reply(embed);
    }

}

module.exports = GenreInfoCommand;