import { Message } from "eris";

export default (message: Message, args: string[], checkPassed: boolean): void => {
    if (!checkPassed) {
        message.channel.createMessage(`${message.author.mention}, what are you trying to do here? :eyes:`);
    }
};