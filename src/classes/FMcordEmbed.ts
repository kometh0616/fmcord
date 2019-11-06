import { RichEmbed, Message } from "discord.js";

export default class FMcordEmbed extends RichEmbed {

    public constructor(message: Message) {
        super();
        this.setColor(message.member ? message.member.displayColor : 16777215)
            .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
            .setTimestamp();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addField(name: any, value: any, inline?: boolean): this {
        if (value && value.length < 1024 && value.length > 0) {
            super.addField(name, value, inline);
        }
        return this;
    }

}