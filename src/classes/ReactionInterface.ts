import { Message, MessageReaction, User } from "discord.js";

type ReactionListener = (reaction: MessageReaction, user: User) => void;

export default class ReactionInterface {

    private readonly message: Message;
    private readonly author: User;
    private readonly events: Map<string, ReactionListener>;
    private timer!: NodeJS.Timeout;
    private readonly invoke: ReactionListener;
    public constructor(message: Message, author: User) {
        this.message = message;
        this.author = author;
        this.events = new Map<string, ReactionListener>();
        this.invoke = (reaction, user): void => {
            const func: ReactionListener | undefined = this.events.get(reaction.emoji.name);
            if (func && !user.bot) {
                clearTimeout(this.timer);
                this.timer = setTimeout(this.destroy, 30000);
                func(reaction, user);
            }
        };
        this.message.client.on(`messageReactionAdd`, this.invoke);
        this.message.client.on(`messageReactionRemove`, this.invoke);
    }

    public async setKey(key: string, func: () => void): Promise<void> {
        const eventFunc: ReactionListener = (reaction, user) => {
            const reactionCheck = this.author.id === user.id && reaction.message.id === this.message.id;
            if (reactionCheck) {
                func();
            }
        };
        this.events.set(key, eventFunc);
        await this.message.react(key);
    }

    public destroy(): void {
        this.events.clear();
        this.message.reactions.filter(x => x.me).forEach(x => { x.remove(); });
        this.message.client.off(`messageReactionAdd`, this.invoke);
        this.message.client.off(`messageReactionRemove`, this.invoke);
    }

}