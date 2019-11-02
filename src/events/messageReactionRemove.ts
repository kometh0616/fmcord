import FMcord from "../handler/FMcord";
import { MessageReaction, User } from "discord.js";

module.exports = (client: FMcord, reaction: MessageReaction, user: User): void => {
    const coll = client.reactionListeners.get(reaction.message.id);
    if (coll) {
        const key = coll.get(reaction.emoji.name);
        if (key) {
            key(reaction, user);
        }
    }
};