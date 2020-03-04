import { Message, MessageReaction, User, Collection } from "discord.js";
import FMcord from "../handler/FMcord";

export type ReactionListener = (reaction: MessageReaction, user: User) => void;

export default class ReactionInterface {

    private readonly client: FMcord;
    private readonly message: Message;
    private readonly author: User;

    public destroy(): void {
        this.client.reactionListeners.get(this.message.id)!.clear();
        this.message.reactions.cache.filter(x => x.me).forEach(x => { x.remove(); });
    }

    public constructor(client: FMcord, message: Message, author: User) {
        this.client = client;
        this.message = message;
        this.author = author;
        this.destroy = this.destroy.bind(this);
    }

    private add(): void {
        const coll = this.client.reactionListeners.get(this.message.id);
        if (!coll) {
            const newColl = new Collection<string, ReactionListener>();
            this.client.reactionListeners.set(this.message.id, newColl);
        }
    }


    public async setKey(key: string, func: () => void): Promise<void> {
        this.add();
        const coll = this.client.reactionListeners.get(this.message.id);
        coll!.set(key, (reaction, user) => {
            if (reaction.message.id === this.message.id && user.id === this.author.id) {
                func();
            }
        });
        await this.message.react(key);
    }

}