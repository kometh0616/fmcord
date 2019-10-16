import { Client, Snowflake, ClientOptions, Collection, Message } from "discord.js";
import * as path from "path";
import * as fs from "fs";
import Command from "./Command";
import { createConnection } from "typeorm";

export interface FMcordOptions {
    prefix: string;
    token: string;
    apikeys: {
        lastFM: string;
        youtube?: string;
        spotify?: {
            id: string;
            secret: string;
        };
    };
    ownerID: Snowflake;
}

export type Cooldown = Collection<string, number>;

export default class FMcord extends Client {

    public readonly prefix: string;
    public readonly token: string;
    private readonly apikeys: {
        readonly lastFM: string;
        readonly youtube?: string;
        readonly spotify?: {
            readonly id: string;
            readonly secret: string;
        };
    };
    public readonly ownerID: Snowflake;
    public readonly cooldowns: Collection<Snowflake, Cooldown>;
    public readonly executing: Set<Snowflake>;
    public readonly commands: Command[];

    public constructor(botOptions: FMcordOptions, clientOptions?: ClientOptions) {
        super(clientOptions);
        this.prefix = botOptions.prefix;
        this.token = botOptions.token;
        this.apikeys = botOptions.apikeys;
        this.ownerID = botOptions.ownerID;
        this.cooldowns = new Collection<Snowflake, Cooldown>();
        this.executing = new Set<Snowflake>();
        this.commands = [];
    }

    private loadCommands(dir: string = path.join(__dirname, `../commands`)): this {
        const commandNames: string[] = fs.readdirSync(dir);
        commandNames.forEach((name: string) => {
            if (name.endsWith(`.js`)) {
                const Com = require(path.join(dir, name));
                const command = new Com();
                this.commands.push(command);
            }
        });
        return this;
    }
    
    private loadEvents(dir: string = path.join(__dirname, `../events`)): this {
        const eventNames: string[] = fs.readdirSync(dir);
        eventNames.forEach((name: string) => {
            if (name.endsWith(`.js`)) {
                const event: Function = require(path.join(dir, name));
                const eventName: string = name.substring(0, name.length - 3);
                this.on(eventName, event.bind(null, this));
            }
        });
        return this;
    }

    private async loadEntities(dir: string = path.join(__dirname, `../entities/*.js`)): Promise<void> {
        await createConnection({
            type: `sqlite`,
            database: `database.sqlite`,
            entities: [dir],
            synchronize: true
        });
    }

    public async init(): Promise<void> {
        await this.loadEntities();
        this.loadCommands()
            .loadEvents();
        this.on(`message`, (message: Message) => {
            if (!message.content.startsWith(this.prefix) || message.author.bot) {
                return;
            }
            const args: string[] = message.content
                .slice(this.prefix.length)
                .split(/ +/gi);
            const name: string | undefined = args.shift();
            if (name) {
                const commandName: string = name.toLowerCase();
                const command: Command | undefined = this.commands.find((x: Command) => {
                    return x.name === commandName || x.aliases && x.aliases.includes(commandName);
                });
                if (command) {
                    command.execute(this, message, args);
                } else {
                    return;
                }
            }
        });
        this.login(this.token);
    }

}