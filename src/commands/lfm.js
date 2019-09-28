const Command = require(`../classes/Command`);
const { fetchuser } = require(`../utils/fetchuser`);
const getDiscordUser = require(`../utils/DiscordUserGetter`);

class LFMCommand extends Command {

  constructor() {
    super({
      name: `lfm`,
      description: `Gets the LastFM URL of you or a given user.`,
      usage: [`lfm, lfm <discord user>`],
      notes: `The looked up user must be logged in to LastFM with the bot.`,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const fuser = new fetchuser(client, message);
      let discordUser;
      
      if (args[0]) {
        discordUser = getDiscordUser(message, args.join(` `));
        if (!discordUser) {
          await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
          this.context.reason = `No valid user found.`;
          throw this.context;
        }
      } else {
        discordUser = message.author;
      }

      if (discordUser) {
        const user = await fuser.getById(discordUser.id);

        if (user) {
          await message.channel.send(
            `\`${discordUser.user ? discordUser.user.username : discordUser.username}'s\` ` +
            `LastFM URL is: https://last.fm/user/${user.get(`lastFMUsername`)}`
          );
          return this.context;
        } else {
          await message.reply(`\`${discordUser.username}\` is not logged into LastFM.`);
          this.context.reason = `Target user is not logged in.`;
          throw this.context;
        }
      } else {
        await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
        this.context.reason = `No valid user found.`;
        throw this.context;
      }
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = LFMCommand;
