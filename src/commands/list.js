const request = require(`../utils/Request`);
const { fetchuser } = require(`../utils/fetchuser`);
const { RichEmbed } = require(`discord.js`);

exports.run = async (client, message, args) => {
  try {
    const fetchUser = new fetchuser(client, message);
    let method,
      period,
      rootProp,
      subProp,
      mappingFunc,
      num = 0,
      amount;
    const per = new Map()
      .set(`7day`, `weekly`)
      .set(`1month`, `monthly`)
      .set(`overall`, `alltime`);
    switch (args[0]) {
    case `artists`:
      [method, rootProp, subProp, mappingFunc] = [
        `user.gettopartists`,
        `topartists`,
        `artist`,
        x => `${++num}. **${x.name}** - ${x.playcount} plays`
      ];
      break;
    case `songs`:
      [method, rootProp, subProp, mappingFunc] = [
        `user.gettoptracks`,
        `toptracks`,
        `track`,
        x => `${++num}. **${x.name}** by **${x.artist.name}** - ${x.playcount} plays`
      ];
      break;
    default:
      return message.reply(`you haven't defined a proper list type! Correct usage ` +
    `would be \`${client.config.prefix}list <list type> <time period> <list length>\``);
    }
    switch (args[1]) {
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
      period = `7day`;
      if (!isNaN(parseInt(args[1])))
        amount = parseInt(args[1]);
      break;
    }
    if (!amount)
      amount = parseInt(args[2]);
    if (isNaN(amount))
      amount = 10;
    else if (amount > 25) return message.reply(`your list mustn't be bigger than 25 ` +
    `elements.`);
    const user = await fetchUser.get();
    if (!user) return message.reply(client.snippets.noLogin);
    const data = await request({
      method: method,
      user: user.get(`lastFMUsername`),
      period: period,
      limit: amount,
    });
    const arr = data[rootProp][subProp];
    const embed = new RichEmbed()
      .setColor(message.member.displayColor)
      .setURL(`https://last.fm/user/${user.get(`lastFMUsername`)}`)
      .setThumbnail(message.author.avatarURL)
      .setDescription(arr
        .slice(0, amount)
        .map(mappingFunc)
        .join(`\n`))
      .setFooter(`Command executed by ${message.author.tag}`)
      .setTitle(`${user.get(`lastFMUsername`)}'s ${per.get(period)} top ` +
       `${arr.length} ${subProp}s`)
      .setTimestamp();
    await message.channel.send({ embed });
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `list`,
  description: `Provides you a list of your top songs or artists.`,
  usage: `list <list type> <time period> <list length>`,
  notes: `In \`list type\`, you can have \`artists\` or \`songs\`. ` +
  `In \`time period\`, you can have \`weekly\`, \`monthly\` or ` +
  `\`alltime\`. List must not be longer than 25 elements. \`Time period\` ` +
  `and \`list length\` can be omitted, then it defaults to weekly top 10.`
};
