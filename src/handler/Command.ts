import { PermissionString, Message, Collection, TextChannel } from "discord.js";
import FMcord, { Cooldown } from "./FMcord";
import { Disables } from "../entities/Disables";

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

    public abstract readonly run: (client: FMcord, message: Message, args: string[]) => Promise<void>;
    
    public constructor(props: CommandOptions) {
        this.name = props.name;
        this.description = props.description;
        this.usage = props.usage;
        this.aliases = props.aliases || [];
        this.notes = props.notes;
        this.cooldown = props.cooldown;
        this.dmAvailable = props.dmAvailable;
        this.ownerOnly = props.ownerOnly;
        this.helpExempt = props.helpExempt;
        this.permissions = props.permissions || {
            user: 0,
            bot: 0
        };
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

    private async verify(message: Message): Promise<boolean> {
        const notDisabled: boolean = await this.verifyDisabled(message);
        return notDisabled &&
            this.verifyBotPermissions(message) &&
            this.verifyUserPermissions(message) &&
            this.verifyChannel(message) &&
            this.verifyCooldown(message) &&
            this.verifyExecuting(message) &&
            this.verifyOwnerOnly(message);
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
        let log = `Command ${this.name} ${stack ? `executed` : `failed to execute`}!\n` +
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
            console.log(log);
        } else {
            console.error(log);
        }
    }

    public async execute(client: FMcord, message: Message, args: string[]): Promise<void> {
        const runnable: boolean = await this.verify(message);
        if (runnable) {
            try {
                client.executing.add(message.author.id);
                await this.run(client, message, args);
                client.executing.delete(message.author.id);
                this.putOnCooldown(client, message);
                this.log(message);
            } catch (e) {
                this.log(message, e.stack);
            }
        }
    }
}