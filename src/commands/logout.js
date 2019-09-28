const Command = require(`../classes/Command`);
const { fetchuser } = require(`../utils/fetchuser`);

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
      const fetchUser = new fetchuser(client, message);
      const Users = client.sequelize.import(`../models/Users.js`);
      const Crowns = client.sequelize.import(`../models/Crowns.js`);
      const user = await fetchUser.get();
      if (!user) {
        await message.reply(`your instance hasn't been found.`);
        this.context.reason = `No instance of the message author found.`;
        throw this.context;
      }
      const msg = await message.reply(`are you sure you want to log off? All ` +
      `your crowns in all of your guilds will be removed! Click on the reaction ` +
      `to proceed.`);
      await msg.react(`✅`);
      const rcFilter = (reaction, user) => {
        return reaction.emoji.name === `✅` && user.id === message.author.id;
      };
      const rcOptions = { max: 1, time: 30000 };
      const reactions = await msg.awaitReactions(rcFilter, rcOptions);
      if (reactions.size > 0) {
        await Users.destroy({
          where: {
            discordUserID: message.author.id,
          }
        });
        await Crowns.destroy({
          where: {
            userID: message.author.id
          }
        });
        await message.reply(`you've been logged off from your Last.fm account `
        + `succesfully!`);
      } else {
        await message.reply(`you haven't been logged off.`);
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }
}

module.exports = LogoutCommand;
