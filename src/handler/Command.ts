import { PermissionString, Message, Collection, TextChannel } from "discord.js";
import FMcord, { Cooldown } from "./FMcord";
import { Disables } from "../entities/Disables";
import Subcommand from "./Subcommand";
import * as fs from "fs";
import * as path from "path";
import { Users } from "../entities/Users";
import snippets from "../snippets";

interface CommandOptions {
    name: string;
    description: string;
    usage: string[];
    aliases?: string[];
    notes?: string;
    cooldown?: number;
    dmAvailable?: boolean;
    ownerOnly?: boolean;
    helpExempt?: boolean;
    permissions?: {
        user?: PermissionString | 0;
        bot?: PermissionString | 0;
    };
    subcommandDir?: string;
    subcommandRequired?: boolean;
    requiresNickname?: boolean;
}

export default abstract class Command implements CommandOptions {

    public readonly name: string;
    public readonly description: string;
    public readonly usage: string[];
    public readonly aliases?: string[];
    public readonly notes?: string;
    public readonly cooldown?: number;
    public readonly dmAvailable?: boolean;
    public readonly ownerOnly?: boolean;
    public readonly helpExempt?: boolean;
    public readonly permissions?: {
        readonly user?: PermissionString | 0;
        readonly bot?: PermissionString | 0;
    };
    public readonly subcommands: Subcommand[];
    public readonly subcommandRequired?: boolean;
    public readonly requiresNickname?: boolean;

    public abstract async run(client: FMcord, message: Message, args?: string[]): Promise<void>;
    
    public constructor(props: CommandOptions) {
        this.name = props.name;
        this.description = props.description;
        this.usage = props.usage;
        this.aliases = props.aliases ?? [];
        this.notes = props.notes;
        this.cooldown = props.cooldown;
        this.dmAvailable = props.dmAvailable;
        this.ownerOnly = props.ownerOnly;
        this.helpExempt = props.helpExempt;
        this.permissions = props.permissions ?? {
            user: 0,
            bot: 0
        };
        this.subcommands = [];
        if (props.subcommandDir) {
            const files: string[] = fs.readdirSync(props.subcommandDir);
            files.forEach((file: string) => {
                const subcommand = require(path.join(props.subcommandDir!, file));
                this.subcommands.push(new subcommand());
            });
        }
        this.subcommandRequired = props.subcommandRequired;
        this.requiresNickname = props.requiresNickname;
    }

    private verifyChannel(message: Message): boolean {
        if (this.dmAvailable) {
            return true;
        } else if (message.channel.type !== `text`) {
            message.reply(`I cannot execute this command in DM's.`);
            return false;
        } else {
            return true;
        }
    }

    private verifyUserPermissions(message: Message): boolean {
        if (message.guild) {
            if (this.permissions && this.permissions.user) {
                if (message.member.hasPermission(this.permissions.user, false, true, true)) {
                    return true;
                } else {
                    message.reply(`you do not have a permission \`${this.permissions.user}\` to ` +
                    `run command \`${this.name}\`.`);
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    private verifyBotPermissions(message: Message): boolean {
        if (message.guild) {
            if (this.permissions && this.permissions.bot) {
                if (message.member.hasPermission(this.permissions.bot, false, true, true)) {
                    return true;
                } else {
                    message.reply(`you do not have a permission \`${this.permissions.bot}\` to ` +
                    `run command \`${this.name}\`.`);
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    private verifyOwnerOnly(message: Message): boolean {
        if (this.ownerOnly) {
            return message.author.id === (message.client as FMcord).ownerID;
        } else {
            return true;
        }
    }

    private verifyCooldown(message: Message): boolean {
        const client: FMcord = message.client as FMcord;
        if (this.cooldown) {
            if (!client.cooldowns.has(message.author.id)) {
                client.cooldowns.set(message.author.id, new Collection<string, number>());
            }
            const cooldown: Cooldown | undefined = client.cooldowns.get(message.author.id);
            if (cooldown!.has(this.name)) {
                const timeLeft: number = Math.ceil((cooldown!.get(this.name)! - Date.now()) / 1000);
                message.reply(`command \`${this.name}\` is on a cooldown. Please wait ` +
                `\`${timeLeft}\` seconds before using it again.`);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    private verifyExecuting(message: Message): boolean {
        const client: FMcord = message.client as FMcord;
        if (client.executing.has(message.author.id)) {
            message.reply(`you are already executing a command! Please wait until ` + 
            `your command is executed.`);
            return false;
        } else {
            return true;
        }
    }

    private async verifyDisabled(message: Message): Promise<boolean> {
        if (message.guild) {
            const isDisabled: Disables | undefined = await Disables.findOne({
                where: [
                    { discordID: message.guild.id, cmdName: this.name },
                    { discordID: message.channel.id, cmdName: this.name }
                ]
            });
            if (isDisabled) {
                await message.reply(`command \`${this.name}\` is disabled in ` +
                `${isDisabled.discordID === message.channel.id ? `this channel` : message.guild.name}.`);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    private verifySubcommands(message: Message, args: string[]): boolean {
        if (this.subcommandRequired && this.subcommands.length > 0) {
            const subNames: string[] = this.subcommands.map((x: Subcommand) => x.name);
            const subAliases: string[] = this.subcommands.map((x: Subcommand) => {
                if (x.aliases) {
                    return x.aliases;
                }
            }).flat();
            const subs: string[] = [...subNames, ...subAliases];
            if (subs.includes(args[0])) {
                return true;
            } else {
                message.reply(`command \`${this.name}\` must be used with a subcommand. ` + 
                `Here are available subcommands: \`${subs.join(`, `)}\``);
                return false;
            }
        } else {
            return true;
        }
    }

    private async verifyNickname(client: FMcord, message: Message): Promise<boolean> {
        if (this.requiresNickname) {
            const user: Users | undefined = await Users.findOne({
                discordUserID: message.author.id
            });
            if (!user) {
                await message.reply(`you have not set your Last.fm nickname! You can do so by doing ` +
                `\`${client.prefix}setnick <nickname>\`.`);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    private async verify(client: FMcord, message: Message, args: string[]): Promise<boolean> {
        const notDisabled: boolean = await this.verifyDisabled(message);
        const nickname: boolean = await this.verifyNickname(client, message);
        return notDisabled && nickname &&
            this.verifyBotPermissions(message) &&
            this.verifyUserPermissions(message) &&
            this.verifyChannel(message) &&
            this.verifyCooldown(message) &&
            this.verifyExecuting(message) &&
            this.verifyOwnerOnly(message) && 
            this.verifySubcommands(message, args);
    }

    private putOnCooldown(client: FMcord, message: Message): void {
        if (this.cooldown) {
            if (!client.cooldowns.has(message.author.id)) {
                client.cooldowns.set(message.author.id, new Collection<string, number>());
            }
            const cooldown: Cooldown = client.cooldowns.get(message.author.id) as Cooldown;
            cooldown.set(this.name, Date.now() + this.cooldown);
            setTimeout(() => cooldown.delete(this.name), this.cooldown);
        }
    }

    private log(message: Message, stack?: string): void {
        let log = `Command ${this.name} ${!stack ? `executed` : `failed to execute`}!\n` +
        `Message content: ${message.content} (${message.id})\n` + 
        `Executor: ${message.author.tag} (${message.author.id})\n`;
        if (message.channel.type === `dm`) {
            log += `Channel of execution: ${message.channel.id}`;
        } else {
            log += `Channel of execution: ${(message.channel as TextChannel).name} (${message.channel.id})\n`;
        }
        if (message.guild) {
            log += `Guild of execution: ${message.guild.name} (${message.guild.id})\n`;
        }
        log += `Timestamp: ${new Date().toUTCString()}\n`;
        if (stack) {
            log += `Stack: ${stack}\n`;
            console.error(log);
        } else {
            console.log(log);
        }
    }

    public async execute(client: FMcord, message: Message, args: string[]): Promise<void> {
        const runnable: boolean = await this.verify(client, message, args);
        if (runnable) {
            try {
                client.executing.add(message.author.id);
                if (this.subcommands.length > 0 && args[0]) {
                    const subName: string = args[0].toLowerCase();
                    const subcommand: Subcommand | undefined = this.subcommands.find(
                        (x: Subcommand) => x.name === subName || x.aliases && x.aliases.includes(subName)
                    );
                    if (subcommand) {
                        await subcommand.run(client, message, args.slice(1));
                    } else {
                        await this.run(client, message, args);
                    }
                } else {
                    await this.run(client, message, args);
                }
                client.executing.delete(message.author.id);
                this.putOnCooldown(client, message);
                this.log(message);
            } catch (e) {
                client.executing.delete(message.author.id);
                if (e.code === 500) {
                    message.reply(`there is an error within Last.fm's API. Please be patient, it should be fixed soon.`);
                } else {
                    message.reply(snippets.error);
                }
                this.log(message, e.stack);
            }
        }
    }
}