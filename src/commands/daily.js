const Command = require(`../classes/Command`);
const Library = require(`../lib/index.js`);
const moment = require(`moment`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);

class DailyCommand extends Command {

  constructor() {
    super({
      name: `daily`,
      description: `Gets the total number of scrobbles in the last 24 hours`,
      usage: `daily`,
      aliases: [`d`],
      dmAvailable: true
    });
  }

  async run(message) {
    this.setContext(message);
    try {
      const color = message.member ? message.member.displayColor : 16777215;
      const fetchUser = new fetchuser(message.client, message);
      const lib = new Library(message.client.config.lastFM.apikey);
      const Users = message.client.sequelize.import(`../models/Users.js`);
      const user = await fetchUser.get();

      if (!user) {
        await message.channel.send(message.client.snippets.noLogin);
        this.context.reason = message.client.snippets.commonReasons.noLogin;
        throw this.context;
      }

      // Get timestamp from database and attempt to get
      // the time difference from then and now
      let timestamp = user.get(`lastDailyTimestamp`);
      const diff = (timestamp !== null) ? moment(timestamp).diff(moment(), `hours`) : 0;

      // Either there's no timestamp, or the difference is < 0
      // so we want to re-calculate the daily
      if (timestamp === null || diff < 0) {
        // Null timestamp, so we'll just get the last 24 hours
        // worth of scrobbles
        if (timestamp === null) {
          timestamp = moment().subtract(1, `days`);
        } else {
          timestamp = moment(timestamp);
        }

        const lUsername = user.get(`lastFMUsername`);
        const unixTimestamp = timestamp.utc().unix();
        const data = await lib.user.getRecentTracks(lUsername, unixTimestamp);

        // Add new timestamp and play count to database
        await Users.update({
          lastDailyTimestamp: moment().add(1, `days`).utc().toString(),
          dailyPlayCount: data.recenttracks[`@attr`].total,
        }, {
          where: {
            discordUserID: message.author.id
          }
        });

        // build and send embed
        const embed = new RichEmbed()
          .setColor(color)
          .setTitle(`Daily`)
          .setDescription(`You have scrobbled **${data.recenttracks[`@attr`].total}** tracks today!`);

        await message.channel.send(embed);
      } else {
        // Time difference is still too high, don't bother
        // calculating daily, just let the user know
        const embed = new RichEmbed()
          .setColor(color)
          .setTitle(`Daily`)
          .setDescription(`**${user.get(`dailyPlayCount`)}** plays last recorded. Please return in ${diff} hour(s) to get new daily score`);

        await message.channel.send(embed);
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }
}

module.exports = DailyCommand;
