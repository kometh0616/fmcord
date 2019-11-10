import { Message } from "discord.js";
import FMcord from "./FMcord";

export interface SubcommandOptions {
    name: string;
    aliases?: string[];
}

export default abstract class Subcommand implements SubcommandOptions {

    public readonly name: string;
    public readonly aliases?: string[];

    protected constructor(options: SubcommandOptions) {
        this.name = options.name;
        this.aliases = options.aliases ?? [];
    }

    public abstract async run(client: FMcord, message: Message, args?: string[]): Promise<void>;
    
}