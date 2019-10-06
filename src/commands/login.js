const Command = require(`../classes/Command`);
const Library = require(`../lib/lastfm/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

class LoginCommand extends Command {

  constructor() {
    super({
      name: `login`,
      description: `Logs you into the bot system.`,
      usage: [`login <last.fm username>`],
      notes: `You will only be registered to the bot. You won't be able to ` +
      `perform any administrative actions to your Last.fm account, and no ` +
      `one else will be able to do so through the bot.`,
      aliases: [`setnick`],
      dmAvailable: true,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const lib = new Library(client.config.lastFM.apikey);
      const fetchUser = new fetchuser(client, message);
      const Users = client.sequelize.import(`../models/Users.js`);
      const username = args.join(` `);
      if (!args[0]) {
        await message.reply(`you must define a Last.fm username!`);
        this.context.reason = `No username defined!`;
        throw this.context;
      }
      const data = await lib.user.getInfo(username);
      const alreadyExists = await fetchUser.get();
      if (alreadyExists) {
        await message.reply(`you already have logged in via this bot! Please ` +
        `do \`${client.prefix}logout\` if you want to ` +
        `use a different account.`);
        this.context.reason = `User is already logged in.`;
        throw this.context;
      }

      await Users.create({
        discordUserID: message.author.id,
        lastFMUsername: data.user.name
      });
      await message.reply(`your Last.fm username \`${data.user.name}\` ` +
      `has been registered to this bot! Note that you won't be able to ` +
      `perform any administrative actions to it.`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }
}

module.exports = LoginCommand;
