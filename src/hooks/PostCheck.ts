import { Message } from "eris";
import snippets from "../snippets";
import UserFetcher from "../classes/UserFetcher";
import { Disables } from "../entities/Disables";

export default async (message: Message, args: string[], checksPassed: boolean): Promise<void> => {
    if (!checksPassed) {
        const isDisabled = await Disables.findOne({
            where: [
                { discordID: message.channel.id, cmdName: message.command?.label },
                { discordID: message.guildID, cmdName: message.command?.label }
            ]
        });
        if (isDisabled !== undefined) {
            const guildDisabled = isDisabled.discordID === message.guildID;
            await message.channel.createMessage(`${message.author.mention}, command \`${message.command?.label}\` is disabled in ${guildDisabled ? message.member!.guild.name : `this channel`}.`);
        } else {
            const userFetcher = new UserFetcher(message);
            const username = await userFetcher.username();
            if (username === null) {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.noLogin}`);
            }
        }
    }
};