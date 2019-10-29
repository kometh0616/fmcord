import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import { Users } from "../entities/Users";
import { LastFMUser } from "../lib/lastfm/typings";
import Library from "../lib/lastfm";

class SetnickCommand extends Command {

    public constructor() {
        super({
            name: `setnick`,
            description: `Sets your nickname in the bot's database.`,
            usage: [`setnick <nickname>`],
            aliases: [`login`],
            dmAvailable: true,
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (!args.length) {
            await message.reply(`you must define a Last.fm username!`);
        } else {
            try {
                const username: string = args.join(` `);
                const lib = new Library(client.apikeys.lastFM);
                const user: LastFMUser = await lib.user.getInfo(username);
                const newUser = new Users();
                newUser.discordUserID = message.author.id;
                newUser.lastFMUsername = user.name;
                await newUser.save();
                await message.reply(`your nickname \`${user.name}\` was created succesfully!`);
            } catch (e) {
                if (e.message === `SQLITE_CONSTRAINT: UNIQUE constraint failed: users.discordUserID`) {
                    await message.reply(`you already have a nickname set.`);
                }
            }
        }
    }

}

module.exports = SetnickCommand;