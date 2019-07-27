const Command = require(`../classes/Command`);
const { fetchuser } = require(`../utils/fetchuser`);

class LFMCommand extends Command {

  constructor() {
    super({
      name: `lfm`,
      description: `Gets the LastFM URL of you or a given user.`,
      usage: `lfm [Discord User]`,
      notes: `The looked up user must be logged in to LastFM with the bot.`,
      dmAvailable: true,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const fuser = new fetchuser(client, message);
      const discordUser = args[0] ? message.mentions.users.first() : message.author;

      if (discordUser) {
        const user = await fuser.getById(discordUser.id);

        if (user) {
          await message.channel.send(`\`${discordUser.username}'s\` LastFM URL is: https://last.fm/user/${user.get(`lastFMUsername`)}`);
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
