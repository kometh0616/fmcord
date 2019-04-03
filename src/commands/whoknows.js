const fetch = require(`node-fetch`);
const { stringify } = require(`querystring`);
const { RichEmbed } = require(`discord.js`);
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);


exports.run = async (client, message, args) => {
  try {
    const Users = client.sequelize.import(`../models/Users.js`);
    const Crowns = client.sequelize.import(`../models/Crowns.js`);
    const artistName = args.join(` `);
    if (!artistName) return message.reply(`you haven't defined an artist!`);
    const know = [];
    const params = {
      method: `artist.getinfo`,
      artist: artistName,
      api_key: client.config.lastFM.apikey,
      format: `json`
    };
    const query = stringify(params);
    const { artist } = await fetch(client.config.lastFM.endpoint + query)
      .then(r => r.json());

    if (!artist) return message.reply(`there is no such artist as ` +
    `\`${artistName}\` in Last.fm.`);

    const guild = await message.guild.fetchMembers();

    const fetchPlays = () => {
      return new Promise(async res => {
        for (const [id, member] of guild.members) {
          const dbParams = { where: { discordUserID: id } };
          const user = await Users.findOne(dbParams);
          if (!user) continue;
          const queryParams = Object.assign({}, params);
          queryParams.username = user.get(`lastFMUsername`);
          const query = stringify(queryParams);
          const { artist } = await fetch(client.config.lastFM.endpoint + query)
            .then(r => r.json());

          if (!artist.stats.userplaycount) continue;

          const data = {
            name: member.user.username,
            userID: member.user.id,
            plays: artist.stats.userplaycount
          };
          know.push(data);
        }
        res(know);
      });
    };

    let arr = await fetchPlays();

    // Giving a top-ranking listener in the guild his crown, if he still has none.
    const sorted = arr.sort(sortingFunc)[0];
    const hasCrown = await Crowns.findOne({
      where: {
        guildID: message.guild.id,
        artistName: artist.name
      }
    });

    if (hasCrown === null && sorted.plays !== 0) await Crowns.create({
      guildID: message.guild.id,
      userID: sorted.userID,
      artistName: artist.name,
      artistPlays: sorted.plays
    });

    else {
      const userID = hasCrown.userID;
      const plays = hasCrown.artistPlays;
      if (userID !== sorted.userID || plays !== sorted.plays) {
        await Crowns.update({
          userID: sorted.userID,
          artistPlays: sorted.plays,
        },
        {
          where: {
            guildID: message.guild.id,
            artistName: artist.name,
          }
        });
      }
    }

    if (arr.length === 0 || arr.every(x => x.plays === `0`))
      return message.reply(`no one here listens to ${artist.name}.`);
    arr.sort(sortingFunc);
    let x = 0;
    let description = arr
      .sort(sortingFunc)
      .slice(0, 10)
      .filter(k => k.plays !== `0`)
      .map(k => `${++x}. ${k.name} - **${k.plays}** plays`)
      .join(`\n`);
    const embed = new RichEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`Who knows ${artist.name} in ${message.member.guild.name}?`)
      .setThumbnail(artist.image[2][`#text`])
      .setDescription(description)
      .setFooter(`Command invoked by ${message.author.tag}`)
      .setTimestamp();
    await message.channel.send({embed});
  } catch (e) {
    console.error(e);
    await message.channel.send(client.replies.error);
  }
};

exports.help = {
  name: `whoknows`,
  description: `Checks if anyone in a guild listens to a certain artist.`,
  usage: `whoknows <artist name>`,
  notes: `This feature might be quite slow, because it sends a lot of API ` +
  `requests. Also, it only works in a guild.`
};
