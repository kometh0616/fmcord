const Command = require(`../classes/Command`);
const { fetchuser } = require(`../utils/fetchuser`);

class LogoutCommand extends Command {

  constructor() {
    super({
      name: `logout`,
      description: `Logs you out of the bot's system.`,
      usage: `logout`,
      aliases: [`logoff`, `delnick`],
      dmAvailable: true,
    });
  }

  async run(message) {
    this.setContext(message);
    try {
      const fetchUser = new fetchuser(message.client, message);
      const Users = message.client.sequelize.import(`../models/Users.js`);
      const user = await fetchUser.get();
      if (!user) {
        await message.reply(`your instance hasn't been found.`);
        this.context.reason = `No instance of the message author found.`;
        throw this.context;
      }
      await Users.destroy({
        where: {
          discordUserID: message.author.id,
        }
      });
      await message.reply(`you've been logged off from your Last.fm account `
      + `succesfully!`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }
}

module.exports = LogoutCommand;
