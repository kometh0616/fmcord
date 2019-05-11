const fetch = require(`node-fetch`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { stringify } = require(`querystring`);

exports.run = async (client, message, args) => {
  const usageWarning = `Wrong usage of a command, correct usage is ` +
  `\`${client.config.prefix}artistlist <time period> <list length>\`.`;
  try {
    const { endpoint, apikey } = client.config.lastFM;
    const fetchUser = new fetchuser(client, message);
    const user = await fetchUser.get();
    if (!user) return message.reply(client.snippets.noLogin);
    let period, amount;

    if (args.length === 0) {
      period = `7day`;
      amount = 10;
    } else {
      switch (args[0]) {
      case `weekly`:
        period = `7day`;
        break;
      case `monthly`:
        period = `1month`;
        break;
      case `alltime`:
        period = `overall`;
        break;
      default:
        return message.channel.send(usageWarning);
      }

      amount = parseInt(args[1]);
      if (!amount || isNaN(amount)) {
        return message.channel.send(usageWarning);
      } else if (amount > 25) return message.reply(`list size must not be ` +
      `bigger than 25.`);
    }

    const query = stringify({
      method: `user.gettopartists`,
      user: user.get(`lastFMUsername`),
      limit: amount,
      period: period,
      api_key: apikey,
      format: `json`
    });
    const data = await fetch(endpoint + query).then(r => r.json());
    if (data.error) return message.reply(`there was an error when trying to ` +
    `fetch your artists. Please try again later.`);
    const { artist } = data.topartists;
    if (artist.length === 0)
      return message.reply(`you have no scrobbles at a defined period of time.`);
    let num = 0;
    const embed = new RichEmbed()
      .setColor(message.member.displayColor)
      .setURL(`https://last.fm/user/${user.get(`lastFMUsername`)}`)
      .setThumbnail(message.author.avatarURL)
      .setDescription(artist
        .slice(0, amount)
        .map(x => `${++num}. **${x.name}** - ${x.playcount} plays`)
        .join(`\n`))
      .setFooter(`Command executed by ${message.author.tag}`)
      .setTitle(`${user.get(`lastFMUsername`)}'s top ${artist.length} artists`)
      .setTimestamp();
    await message.channel.send({ embed });
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `artistlist`,
  description: `Provides you a list of your top artists.`,
  usage: `artistlist <time period> <list size>`,
  notes: `In time period, you can have "weekly", "monthly" or "overall". ` +
  `List must not be bigger than 25 artists.`
};
