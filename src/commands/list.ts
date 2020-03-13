import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import { Message } from "eris";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";

export default class ListCommand extends CommandParams {

    public constructor() {
        super(`list`, {
            description: `Provides you a list of your top songs or artists.`,
            usage: [
                `list <list type>`, 
                `list <list type> <time period>`, 
                `list <list type> <time period> <list length>`,
                `list <list type> <time period> <list length> <user>`
            ].join(`, `),
            fullDescription: `In \`list type\`, you can have \`artists\` or \`songs\`. ` +
            `In \`time period\`, you can have \`weekly\`, \`monthly\` or ` +
            `\`alltime\`. List must not be longer than 25 elements. \`Time period\` ` +
            `and \`list length\` can be omitted, then it defaults to weekly top 10. ` +
            `You can type the first letter of the parameter as a shortcut.`,
            aliases: [`l`, `top`],
            requirements: {
                custom: UsernameAndNotDisabled,
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
            argsRequired: true,
            invalidUsageMessage: (message: Message) => {
                const subs = [...Object.values(message.command!.subcommands)];
                return `${message.author.mention}, you need to define a proper list type! Proper list types are: \`${subs.map(x => x.label).join(`, `)}\`.`;
            },
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const subs = [...Object.values(message.command!.subcommands)];
        if (![...subs.map(x => x.label), ...subs.map(x => x.aliases).flat()].includes(args[0])) {
            await message.channel.createMessage(`${message.author.mention}, you need to define a proper list type! Proper list types are: \`${subs.map(x => x.label).join(`, `)}\`.`);
        }
    }
}