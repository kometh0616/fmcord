import { CommandClient, ClientOptions, CommandClientOptions, CommandGenerator } from "eris";
import * as path from "path";
import fs from "fs";
import CommandParams from "./CommandParams";
import { createConnection } from "typeorm";
import express from "express";
import http from "http";
import { Prefixes } from "../entities/Prefixes";

export interface FMcordOptions {
    apikeys: {
        lastFM: string;
        youtube?: string;
        spotify?: {
            id: string;
            secret: string;
        };
        dbl?: string;
    };
    ownerID: string;
}

export default class FMcord extends CommandClient {
    public readonly prefix: string;
    public readonly apikeys: {
        readonly lastFM: string;
        readonly youtube?: string;
        readonly spotify?: {
            readonly id: string;
            readonly secret: string;
        };
        readonly dbl?: string;
    };
    public readonly ownerID: string;
    public readonly guildPrefixes: { [s: string]: string };

    public constructor(token: string, options: ClientOptions, commandOptions: CommandClientOptions, config: FMcordOptions) {
        super(token, options, commandOptions);
        this.apikeys = config.apikeys;
        this.ownerID = config.ownerID;
        this.prefix = commandOptions.prefix as string;
        this.guildPrefixes = {};
    }

    private loadCommands(dir: string = path.join(__dirname, `..`, `commands`)): this {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file.endsWith(`.js`) || file.endsWith(`.ts`)) {
                const CommandParam = require(path.join(dir, file)).default;
                const cParams: CommandParams = new CommandParam();
                const command = this.registerCommand(cParams.name, cParams.execute as CommandGenerator, cParams.options);
                try {
                    const subDir = path.join(dir, file).slice(0, -3);
                    const lstat = fs.lstatSync(subDir);
                    if (lstat.isDirectory()) {
                        const subFiles = fs.readdirSync(subDir);
                        subFiles.forEach(subFile => {
                            const SubcommandParam = require(path.join(subDir, subFile)).default;
                            const sParams: CommandParams = new SubcommandParam();
                            command.registerSubcommand(sParams.name, sParams.execute as CommandGenerator, sParams.options);
                        });
                    }
                } catch (e) {
                    if (!e.message.startsWith(`ENOENT`)) {
                        console.error(e);
                    }
                }
            }
        });
        return this;
    }

    private loadEvents(dir: string = path.join(__dirname, `..`, `events`)): this {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file.endsWith(`.js`) || file.endsWith(`.ts`)) {
                const event: Function = require(path.join(dir, file)).default;
                const eventName = file.substring(0, file.length - 3);
                this.on(eventName, event.bind(null, this));
            }
        });
        return this;
    }

    private async loadEntities(dir: string = path.join(__dirname, `..`, `entities/*.{ts,js}`)): Promise<this> {
        await createConnection({
            type: `sqlite`,
            database: path.join(__dirname, `..`, `../database.sqlite`),
            entities: [dir],
            synchronize: true
        });
        return this;
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

    private async loadPrefixes(): Promise<this> {
        const prefixes = await Prefixes.find();
        prefixes.forEach(({ guildID, prefix }) => {
            this.registerGuildPrefix(guildID, prefix);
        });
        return this;
    }

    public init(): void {
        this.loadCommands()
            .loadEvents()
            .addExpressListener()
            .loadEntities()
            .then(client => client.loadPrefixes())
            .then(client => client.connect());
    }
}
