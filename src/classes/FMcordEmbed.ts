/* eslint-disable @typescript-eslint/camelcase */
import { Message, Embed } from "eris";

export default class FMcordEmbed implements Embed {

    public type: string;
    public title?: string;
    public description?: string;
    public author?: {
        name: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    public footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    public color?: number;
    public url?: string;
    public thumbnail?: {
        url?: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    public fields: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    public timestamp?: string | Date;
    public constructor(message: Message) {
        this.type = `rich`;
        if (message.member !== null) {
            const role = message.member!.roles
                .map(id => message.member!.guild.roles.get(id)!)
                .sort((a, b) => b.position - a.position)
                .find(r => r.color !== 0);
            this.color = role?.color ?? 16777215;
        } else {
            this.color = 16777215;
        }
        this.footer = {
            text: `Command executed by ${message.author.username}#${message.author.discriminator}`,
            icon_url: message.author.avatarURL
        };
        this.timestamp = new Date();
        this.fields = [];
    }

    public addField(name: string, value: string, inline?: boolean): this {
        this.fields.push({ name, value, inline });
        return this;
    }

    public clearFields(): this {
        this.fields = [];
        return this;
    }

    public setTitle(title: string): this {
        this.title = title;
        return this;
    }
    
    public setColor(color: number): this {
        this.color = color;
        return this;
    }

    public setDescription(description: string): this {
        this.description = description;
        return this;
    }

    public setAuthor(name: string, iconUrl: string): this {
        this.author = { name, icon_url: iconUrl };
        return this;
    }

    public setURL(url: string): this {
        this.url = url;
        return this;
    }

    public setFooter(text: string, icon?: string): this {
        this.footer = { text, icon_url: icon };
        return this;
    }

    public setTimestamp(timestamp: string | Date): this {
        this.timestamp = timestamp;
        return this;
    }

    public setThumbnail(url: string): this {
        this.thumbnail = { url };
        return this;
    }

}