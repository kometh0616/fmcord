import { Message } from "eris";
import { Disables } from "../entities/Disables";

export default async (message: Message): Promise<boolean> => {
    if (message.member === undefined) {
        return true;
    } else {
        const isDisabled = await Disables.findOne({
            where: [
                { discordID: message.channel.id, cmdName: message.command?.label },
                { discordID: message.guildID, cmdName: message.command?.label }
            ]
        });
        return isDisabled === undefined;
    }
};