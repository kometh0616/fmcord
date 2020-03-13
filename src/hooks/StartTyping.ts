import { Message } from "eris";

export default (message: Message): void => {
    message.channel.sendTyping();
};