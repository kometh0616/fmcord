const Command = require(`../classes/Command`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
const getDiscordMember = require(`../utils/DiscordUserGetter`);

class CrownsCommand extends Command {

  constructor() {
    super({
      name: `crowns`,
      description: `Shows you all crowns of artists you have. Once you listen to ` +
      `a certain artist the most in the guild, you get a crown of that artist in ` +
      `the guild.`,
      usage: `crowns`,
      notes: `Crowns are updated every time someone invokes a \`whoknows\` command.`,
      aliases: [`cw`],
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      if (args[0] === `--notify`) {
        const Notifs = client.sequelize.import(`../models/Notifs.js`);
        const notif = await Notifs.findOne({
          where: {
            userID: message.author.id
          }
        });
        if (!notif) {
          await Notifs.create({ userID: message.author.id });
          await message.reply(`I will message you in your DM's every time ` +
          `someone takes your crown from a server. Make sure to enable your ` +
          `DM's (you can do so by going to Settings -> Privacy and Security ` +
          `-> Allow direct messages from server members.) so that I could ` +
          `notify you.\nYou can always disable this feature by doing ` +
          `\`${client.config.prefix}crowns --notify\` again.`);
        } else {
          await Notifs.destroy({
            where: {
              userID: message.author.id
            }
          });
          await message.reply(`you will no longer be notified when someone ` +
          `takes your crown.\nTo re-enable this feature, do ` +
          `\`${client.config.prefix}crowns --notify\` again.`);
        }
      } else {
        const member = getDiscordMember(message, args.join(` `));
        if (!member) {
          await message.reply(client.snippets.userNotFound);
          this.context.reason = client.snippets.commonReasons.userNotFound;
          throw this.context;
        }
        const fetchUser = new fetchuser(client, message);
        const Crowns = client.sequelize.import(`../models/Crowns.js`);
        const user = await fetchUser.getById(member.id);
        if (!user) {
          if (member.id === message.author.id) {
            await message.reply(client.snippets.noLogin);
            this.context.reason = client.snippets.commonReasons.noLogin;
            throw this.context;
          } else {
            await message.reply(client.snippets.userNoLogin);
            this.context.reason = client.snippets.commonReasons.userNoLogin;
            throw this.context;
          }
        }
        const URL = `https://last.fm/user/${user.get(`lastFMUsername`)}`;
        const userCrowns = await Crowns.findAll({
          where: {
            userID: member.id,
            guildID: message.guild.id
          }
        });
        let num = 0;
        const validCrowns = userCrowns
          .map(x => {
            return {
              name: x.get(`artistName`),
              plays: parseInt(x.get(`artistPlays`)),
              userID: x.get(`userID`),
              guildID: x.get(`guildID`)
            };
          })
          .filter(x => message.guild.id === x.guildID
          && member.user.id === x.userID);
        if (validCrowns.length === 0) {
          await message.reply(`no crowns found.`);
          this.context.reason = `No valid crowns found.`;
          throw this.context;
        }
        const description = validCrowns
          .sort((a,b) => b.plays - a.plays)
          .slice(0, 10)
          .map(x => `${++num}. **${x.name}** with ${x.plays} plays`)
          .join(`\n`) + `\n\nTotal amount of crowns: **${validCrowns.length}**`;
        const title = `Crowns of ${user.get(`lastFMUsername`)} ` +
        `in ${message.guild.name}`;
        const footer = `Command invoked by ${message.author.tag}`;
        if (description.length === 0) {
          await message.reply(`no crowns found.`);
          this.context.reason = `No valid crowns found.`;
          throw this.context;
        }
        const embed = new RichEmbed()
          .setTitle(title)
          .setColor(message.member.displayColor)
          .setURL(URL)
          .setDescription(description)
          .setFooter(footer)
          .setTimestamp()
          .setThumbnail(member.user.avatarURL);
        const msg = await message.channel.send({ embed });
        if (validCrowns.length > 10) {
          const rl = new ReactionInterface(msg, message.author);
          const length = Math.ceil(userCrowns.length / 10);
          let offset = 0, page = 1;
          const func = async off => {
            let num = off;
            const description = validCrowns
              .sort((a, b) => b.plays - a.plays)
              .slice(off, off + 10)
              .map(x => `${++num}. **${x.name}** with ${x.plays} plays`)
              .join(`\n`) + `\n\nTotal amount of crowns: **${validCrowns.length}**`;
            const embed = new RichEmbed()
              .setTitle(title)
              .setColor(message.member.displayColor)
              .setURL(URL)
              .setDescription(description)
              .setFooter(`Command invoked by ${message.author.tag}`)
              .setTimestamp()
              .setThumbnail(member.user.avatarURL);
            await msg.edit({ embed });
          };
          const toFront = () => {
            if (page !== length) {
              offset += 10, page++;
              func(offset);
            }
          };
          const toBack = () => {
            if (page !== 1) {
              offset -= 10, page--;
              func(offset);
            }
          };
          await rl.setKey(client.snippets.arrowLeft, toBack);
          await rl.setKey(client.snippets.arrowRight, toFront);
          await rl.setKey(client.snippets.exit, rl.destroy);
        }
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = CrownsCommand;
