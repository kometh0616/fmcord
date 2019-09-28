const Command = require(`../classes/Command.js`);
const { fetchuser } = require(`../utils/fetchuser`);

class MyLoginCommand extends Command {

  constructor() {
    super({
      name: `mylogin`,
      description: `Shows you a Last.fm username you have registered yourself ` +
      `with, if any.`,
      usage: [`mylogin`],
      aliases: [`me`],
      dmAvailable: true,
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      const fetchUser = new fetchuser(client, message);
      const user = await fetchUser.get();
      if (!user) await message.reply(`you haven't logged into my system. You ` +
      `can do so by doing \`${client.prefix}login ` +
      `<your last.fm username>\`.`);
      else {
        const name = user.get(`lastFMUsername`);
        await message.reply(`you have logged in as \`${name}\`.`);
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = MyLoginCommand;
