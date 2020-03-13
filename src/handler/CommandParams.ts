import { CommandOptions, Message, MessageContent } from "eris";

export default abstract class CommandParams {

    public readonly name: string;
    public readonly options: CommandOptions;
    public abstract async execute(message: Message, args: string[]): Promise<MessageContent | void>;
    public constructor(name: string, options: CommandOptions) {
        this.name = name;
        this.options = options;
    }

}