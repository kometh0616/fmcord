# FMCord

FMCord is a Discord bot with a large variety of Last.fm related utilities and commands. Currently, the bot can:

- Create varying album charts
- Tell you what artists you have in similar with other users
- Show you what artists you have the most listens of in a server
- Fetch searched tracks from YouTube
- Show the current song(s) you're playing
- Show you a list of your favorite artists/songs
Other minor commands exist as well, and more are being planned

FMCord also has small moderation support which allows admins/mods to disable certain commands on a channel or whole server. It also allows you to customize bot's prefix in your guild. Get started by typing &help --manual!

FMCord is written in a Javascript language. The libraries for development used are:
- [Discord.js](https://discord.js.org/) - for interaction with Discord API
- [moment.js](https://momentjs.com) - For DateTime manipulation
- [node-canvas](https://www.npmjs.com/package/canvas) - for image manipulation

Want to report an issue/bug? Head over to "Issues" tab and submit one, or join an [official FMCord Discord Server](https://discord.gg/BrJ6zEk) and ask your questions there.

You can invite the bot to your Discord server with this [link.](https://discordbots.org/bot/521041865999515650)

### Self-hosting

To clone this repository, do this in your terminal:
```
git clone https://github.com/kometh0616/fmcord.git
cd fmcord
```

You'll need to create a folder where `database.sqlite` will be stored as well:
```
mkdir .data
```
Make sure the folder is called .data.

Now, you need to store your credentials in a `config.json` file. There are 2 ways to add them:
1. Filling in `config.example.json` file
2. Using a prompt in `index.js` file

First way tutorial:
1. Open `config.example.json` file.
2. Fill in all the values inside quote marks at the right.

Second way tutorial:
1. Do `node index.js` in your terminal.
2. Follow the instructions on screen.
