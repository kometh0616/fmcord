import { Message, Snowflake } from "discord.js";
import { Users } from "../entities/Users";

export default class UserFetcher {

    protected readonly message: Message;

    public constructor(message: Message) {
        this.message = message;
    }

    public async getByID(id: Snowflake): Promise<Users | undefined> {
        const user: Users | undefined = await Users.findOne({
            discordUserID: id,
        });
        return user;
    }

    public async getAuthor(): Promise<Users | undefined> {
        const author: Users | undefined = await this.getByID(this.message.author.id);
        return author;
    }

    public async username(): Promise<string | null> {
        const user: Users | undefined = await this.getAuthor();
        if (user) {
            return user.lastFMUsername;
        } else {
            return null;
        }
    }

    public async usernameFromID(id: Snowflake): Promise<string | null> {
        const user: Users | undefined = await this.getByID(id);
        if (user) {
            return user.lastFMUsername;
        } else {
            return null;
        }
    }

}