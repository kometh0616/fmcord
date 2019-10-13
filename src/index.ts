import { Client, Message } from 'discord.js';
import config from '../config.json';

const client: Client = new Client();

client.on(`message`, (message: Message) => {
    if (message.content.startsWith(`hello`)) {
        message.reply(`Hello!`);
    }
});

client.login(config.token);