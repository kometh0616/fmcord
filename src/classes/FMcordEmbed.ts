import { RichEmbed, Message } from "discord.js";

export default class FMcordEmbed extends RichEmbed {

    public constructor(message: Message) {
        super();
        this.setColor(message.member ? message.member.displayColor : 16777215)
            .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
            .setThumbnail(message.author.avatarURL)
            .setTimestamp();
    }

}