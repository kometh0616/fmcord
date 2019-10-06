const Command = require(`../classes/Command`);

class LogoutCommand extends Command {

  constructor() {
    super({
      name: `logout`,
      description: `Logs you out of the bot's system.`,
      usage: [`logout`],
      aliases: [`logoff`, `delnick`],
      dmAvailable: true,
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      const Users = client.sequelize.import(`../models/Users.js`);
      const amount = await Users.destroy({
        where: {
          discordUserID: message.author.id,
        }
      });
      if (amount) {
        await message.reply(`you've been logged off from your Last.fm account succesfully!`);
      } else {
        await message.reply(`your instance hasn't been found. No changes were made.`);
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }
}

module.exports = LogoutCommand;
