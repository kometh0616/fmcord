import { Message, Snowflake } from "discord.js";
import { Users } from "../entities/Users";
import { Modes } from "../entities/Modes";
import NowPlayingMode from "../enums/NowPlayingMode";
import { GuildModes } from "../entities/GuildModes";

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

    private async guildMode(): Promise<NowPlayingMode | undefined> {
        const guildMode = await GuildModes.findOne({
            discordID: this.message.guild?.id
        });
        return guildMode?.nowPlayingMode;
    }

    public async mode(): Promise<NowPlayingMode | null> {
        const user = await this.getAuthor();
        if (user !== null) {
            const mode = await Modes.findOne({
                user
            });
            const guildMode = await this.guildMode();
            if (mode !== undefined) {
                if (guildMode) {
                    return Math.max(mode.nowPlayingMode, guildMode);
                } else {
                    return mode.nowPlayingMode;
                }
            } else if (guildMode !== undefined) {
                return guildMode;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public async modeFromID(id: Snowflake): Promise<NowPlayingMode | null> {
        const user = await this.getByID(id);
        if (user !== null) {
            const mode = await Modes.findOne({
                user
            });
            const guildMode = await this.guildMode();
            if (mode !== undefined) {
                if (guildMode !== undefined) {
                    return Math.max(mode.nowPlayingMode, guildMode);
                } else {
                    return mode.nowPlayingMode;
                }
            } else if (guildMode !== undefined) {
                return guildMode;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

}