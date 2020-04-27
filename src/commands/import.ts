import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import NotDisabled from "../checks/NotDisabled";
import { Message } from "eris";
import https from "https";
import fs from "fs";
import * as path from "path";
import { getConnection } from "typeorm";
import { Users } from "../entities/Users";

function downloadFile(message: Message, filePath: string): Promise<void> {
    const stream = fs.createWriteStream(filePath);
    return new Promise<void>((resolve, reject) => {
        https.get(message.attachments[0].url, response => {
            response.pipe(stream);
            stream.on(`finish`, () => resolve(stream.close()));
        }).on(`error`, err => {
            fs.unlinkSync(filePath);
            reject(err);
        });
    });
}

export default class ImportCommand extends CommandParams {

    public constructor() {
        super(`import`, {
            description: `Imports all your users from a JSON file.`,
            usage: `import`,
            fullDescription: `Compatible with Chuu and .fmbot's user imports. ` +
            `Users that are already in the database are skipped.\n` +
            `This command requires Manage Server permission. Can be overriden ` +
            `if you have Administrator permissions, or if you are an owner of the guild.`,
            hooks: {
                preCommand: StartTyping,
                async postCheck(message: Message, args: string[], checksPassed: boolean): Promise<void> {
                    if (!checksPassed) {
                        if (message.attachments.length === 0) {
                            await message.channel.createMessage(`${message.author.mention}, no JSON file was given!`);
                            return;
                        } else if (!message.attachments[0].filename.endsWith(`.json`)) {
                            await message.channel.createMessage(`${message.author.mention}, file provided is not a JSON file.`);
                            return;
                        } else {
                            await PostCheck(message, args, checksPassed);
                        }
                    }
                },
            },
            requirements: {
                permissions: {
                    manageGuild: true
                },
                async custom(message: Message): Promise<boolean> {
                    return message.attachments.length > 0 &&
                    message.attachments[0].filename.endsWith(`.json`) &&
                    await NotDisabled(message);
                },
            },
            guildOnly: true,
            permissionMessage: (message: Message) => `${message.author.mention}, you do not have a permission \`Manage Guild\` to use this command.`
        });
    }

    public async execute(message: Message): Promise<void> {
        const filePath = path.join(__dirname, message.attachments[0].filename);
        await downloadFile(message, filePath);
        try {
            const users = require(filePath);
            if (users?.every?.((x: Record<string, string>) => typeof x?.discordUserID === `string` && typeof x?.lastFMUsername === `string`)) {
                const allUsers = await Users.find();
                const IDs = allUsers.map(x => x.discordUserID);
                const filteredUsers = users.filter((x: Record<string, string>) => !IDs.includes(x.discordUserID));
                if (filteredUsers.length > 0) {
                    await getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(Users)
                        .values(filteredUsers)
                        .execute();
                    await message.channel.createMessage(`${message.author.mention}, user import has succeeded!`);
                    fs.unlinkSync(filePath); 
                } else {
                    await message.channel.createMessage(`${message.author.mention}, all the users from the file are already in my database. No changes were made.`);
                }
            } else {
                await message.channel.createMessage(`${message.author.mention}, your JSON file is of incorrect format! No changes were made.`);
            }
        } catch (e) {
            fs.unlinkSync(filePath);
            if (e instanceof SyntaxError) {
                await message.channel.createMessage(`${message.author.mention}, broken JSON file was provided. No changes were made.`);
            } else {
                console.error(e);
            }
        }
    }
    
}