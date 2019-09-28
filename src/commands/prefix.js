const Command = require(`../classes/Command`);

class PrefixCommand extends Command {

  constructor() {
    super({
      name: `prefix`,
      description: `Configures prefix in the guild.`,
      usage: [`prefix set <prefix>`, `prefix delete`],
      notes: `This command requires Manage Server permission. Can be overriden ` +
      `if you have Administrator permissions, or if you are an owner of the guild.\n` +
      `Prefix must not be longer than 2 symbols and must not contain whitespace. ` +
      `For example, \`f/\` would be a valid prefix, while \`===\` and \`+ +\` ` +
      `would be not.`,
      permissions: {
        user: `MANAGE_GUILD`,
        bot: 0
      }
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const Prefixes = client.sequelize.import(`../models/Prefixes.js`);
      const hasPrefix = await Prefixes.findOne({
        where: {
          guildID: message.guild.id
        }
      });
      if (args[0] === `set`) {
        const prefix = args[1];
        if (prefix.length < 3 && prefix !== client.config.prefix) {
          if (hasPrefix) {
            await Prefixes.update({
              prefix
            }, {
              where: {
                guildID: message.guild.id
              }
            });
          } else {
            await Prefixes.create({
              guildID: message.guild.id,
              prefix
            });
          }
          await message.reply(`prefix in ${message.guild.name} has been set to ` +
          `\`${prefix}\` succesfully.`);
        } else if (prefix.length >= 3) {
          await message.reply(`your prefix is too long! It cannot be longer than ` +
          `2 symbols.`);
          this.context.reason = `Prefix is too long.`;
          throw this.context;
        } else if (prefix === client.config.prefix) {
          await message.reply(`you can't have a default prefix as a custom prefix, ` +
          `that's illogical.`);
          this.context.reason = `Invalid prefix.`;
          throw this.context;
        }
      } else if (args[0] === `delete`) {
        const destroyedPrefs = await Prefixes.destroy({
          where: {
            guildID: message.guild.id
          }
        });
        if (destroyedPrefs) {
          await message.reply(`prefix removed succesfully.`);
        } else {
          await message.reply(`no prefix found. No changes were made.`);
        }
      } else {
        let reply = `prefix in this guild is `;
        if (hasPrefix) {
          reply += `\`${hasPrefix.prefix}\`. You can always use the default prefix of ` +
          `this bot, which is \`${client.config.prefix}\`.`;
        } else {
          reply += `not set. The default prefix of this bot is \`${client.config.prefix}\`.`;
        }
        await message.reply(reply);
      }
      return this.context;
    } catch (e) {
      if (e.name !== `SequelizeUniqueConstraintError`) {
        this.context.stack = e.stack;
        throw this.context;
      }
    }
  }

}

module.exports = PrefixCommand;