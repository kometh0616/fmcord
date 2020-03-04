import { Client, Snowflake, ClientOptions, Collection, Message, Guild } from "discord.js";
import * as path from "path";
import * as fs from "fs";
import Command from "./Command";
import { createConnection } from "typeorm";
import { Prefixes } from "../entities/Prefixes";
import DBL from "dblapi.js";
import express from "express";
import http from "http";
import { ReactionListener } from "../classes/ReactionInterface";


type Keys = Collection<string, ReactionListener>;

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
        dbl?: string;
    };
    ownerID: Snowflake;
}

export type Cooldown = Collection<string, number>;

export default class FMcord extends Client {

    public readonly defaultPrefix: string;
    public prefix: string;
    public readonly token: string;
    public readonly apikeys: {
        readonly lastFM: string;
        readonly youtube?: string;
        readonly spotify?: {
            readonly id: string;
            readonly secret: string;
        };
        readonly dbl?: string;
    };
    public readonly ownerID: Snowflake;
    public readonly cooldowns: Collection<Snowflake, Cooldown>;
    public readonly executing: Set<Snowflake>;
    public readonly commands: Command[];
    public readonly reactionListeners: Collection<Snowflake, Keys>;

    public constructor(botOptions: FMcordOptions, clientOptions?: ClientOptions) {
        super(clientOptions);
        this.prefix = botOptions.prefix;
        this.defaultPrefix = botOptions.prefix;
        this.token = botOptions.token;
        this.apikeys = botOptions.apikeys;
        this.ownerID = botOptions.ownerID;
        this.cooldowns = new Collection<Snowflake, Cooldown>();
        this.executing = new Set<Snowflake>();
        this.commands = [];
        this.reactionListeners = new Collection<Snowflake, Keys>();
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
            database: path.join(__dirname, `../database.sqlite`),
            entities: [dir],
            synchronize: true
        });
    }

    private async getPrefix(guild?: Guild | null): Promise<string | null> {
        if (guild) {
            const prefix: Prefixes | undefined = await Prefixes.findOne({
                guildID: guild.id
            });
            if (prefix) {
                return prefix.prefix;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private addExpressListener(): this {
        const app = express();

        app.get(`/`, (request, response) => {
            response.sendStatus(200);
        });

        app.listen(process.env.PORT);

        setInterval(() => {
            http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
        }, 280000);

        return this;
    }

    public async init(): Promise<void> {
        await this.loadEntities();
        this.loadCommands()
            .loadEvents()
            .addExpressListener();
        if (this.apikeys.dbl) {
            const dbl = new DBL(this.apikeys.dbl, this);

            dbl.on(`posted`, () => {
                console.log(`Server count posted to discordbots.org!`);
            });
            dbl.on(`error`, e => {
                console.error(`DBL error: ${e}`);
            });
        }
        this.on(`message`, (message: Message) => {
            this.getPrefix(message.guild).then(x => {
                this.prefix = x ?? this.defaultPrefix;
                const mention = message.mentions.users.firstKey();
                if (mention && mention === this.user?.id) {
                    message.reply(`my prefix in this server is \`${this.prefix}\`. ` + 
                    `Do \`${this.prefix}help\` to find out more about my functionality.`);
                    return;
                }
                if (!message.content.startsWith(this.prefix) && !message.content.startsWith(this.defaultPrefix) || message.author.bot) {
                    return;
                }
                const args: string[] = message.content
                    .slice(this.prefix.length)
                    .split(/ +/gi);
                const name: string | undefined = args.shift();
                if (name) {
                    const commandName: string = name.toLowerCase();
                    const command: Command | undefined = this.commands.find((x: Command) => {
                        return x.name === commandName || x.aliases?.includes(commandName);
                    });
                    if (command) {
                        command.execute(this, message, args);
                    } else {
                        return;
                    }
                }
            });
        });
        this.login(this.token).then(() => console.log(`Logged in.`));
    }

}