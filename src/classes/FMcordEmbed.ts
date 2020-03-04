import { MessageEmbed, Message } from "discord.js";

export default class FMcordEmbed extends MessageEmbed {

    public constructor(message: Message) {
        super();
        this.setColor(message.member?.displayColor ?? 16777215)
            .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL() ?? undefined)
            .setTimestamp();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addField(name: any, value: any, inline?: boolean): this {
        if (value !== undefined && value !== null) {
            if (value.length) {
                if (value.length < 1024 && value.length > 0) {
                    super.addField(name, value, inline);
                }
            } else {
                super.addField(name, value, inline);
            }
        }  
        return this;
    }

}