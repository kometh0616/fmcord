const fetch = require(`node-fetch`);
const { stringify } = require(`querystring`);
const { RichEmbed } = require(`discord.js`);
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);
const { fetchuser } = require(`../utils/fetchuser`);
const { Op } = require(`sequelize`);


exports.run = async (client, message, args) => {
  const isCooled = client.cooldowns.find(
    x => x.name === this.help.name && x.userID === message.author.id
  );
  if (isCooled)
    return message.reply(`this command is on a cooldown due to overusage. ` +
    `Please wait 8 seconds before you can use it again.`);
  client.cooldowns.push({
    name: this.help.name,
    userID: message.author.id,
  });
  const fetchUser = new fetchuser(client, message);
  try {
    const Users = client.sequelize.import(`../models/Users.js`);
    const Crowns = client.sequelize.import(`../models/Crowns.js`);
    const Notifs = client.sequelize.import(`../models/Notifs.js`);
    let artistName = args.join(` `);
    const user = await fetchUser.get();
    if (!artistName) {
      if (!user) return message.reply(`you haven't registered your Last.fm ` +
      `account, therefore, I can't check what you're listening to. To set ` +
      `your Last.fm nickname, do \`&login <lastfm username>\`.`);
      const username = user.lastFMUsername;
      const params = {
        method: `user.getrecenttracks`,
        user: username,
        api_key: client.config.lastFM.apikey,
        format: `json`
      };
      const query = stringify(params);
      const data = await fetch(client.config.lastFM.endpoint + query)
        .then(r => r.json());
      const track = data.recenttracks.track[0];
      if (!track[`@attr`])
        return message.reply(`currently, you are not listening to anything.`);
      else artistName = track.artist[`#text`];
    }
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
      return new Promise(async (res, rej) => {
        for (const [id, member] of guild.members) {
          const dbParams = { where: { discordUserID: id } };
          const user = await Users.findOne(dbParams);
          if (!user) continue;
          const queryParams = Object.assign({}, params);
          queryParams.username = user.get(`lastFMUsername`);
          const query = stringify(queryParams);
          const req = await fetch(client.config.lastFM.endpoint + query)
            .then(r => r.json());

          if (req.error) rej({
            apiError: true,
            info: {
              code: req.error,
              message: req.message,
            }
          });
          if (!req.artist.stats.userplaycount) continue;

          const data = {
            name: member.user.username,
            userID: member.user.id,
            plays: req.artist.stats.userplaycount
          };
          know.push(data);
        }
        res(know);
      });
    };

    const arr = await fetchPlays();

    // Giving a top-ranking listener in the guild his crown, if he still has none.
    const sorted = arr.sort(sortingFunc)[0];
    const hasCrown = await Crowns.findOne({
      where: {
        guildID: message.guild.id,
        artistName: artist.name
      }
    });

    if (hasCrown === null && sorted.plays !== `0`) {
      await Crowns.create({
        guildID: message.guild.id,
        userID: sorted.userID,
        artistName: artist.name,
        artistPlays: sorted.plays
      });
    }


    else if (hasCrown !== null) {
      const userID = hasCrown.userID;
      const isUser = await Users.findOne({
        where: {
          [Op.or]: [{discordUserID: userID}, {discordUserID: sorted.userID}]
        }
      });
      const plays = hasCrown.artistPlays;
      if (plays < sorted.plays) {
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
        const notifiable = await Notifs.findOne({
          where: {
            userID: userID
          }
        });
        if (notifiable && isUser) client.emit(`crownTaken`, {
          prevOwner: userID,
          newOwner: sorted.userID,
          guild: message.guild.name,
          artist: artist.name
        });
      }
    }

    if (arr.length === 0 || arr.every(x => x.plays === `0`))
      return message.reply(`no one here listens to ${artist.name}.`);
    arr.sort(sortingFunc);
    let x = 0;
    const description = arr
      .sort(sortingFunc)
      .slice(0, 10)
      .filter(k => k.plays !== `0`)
      .map(k => `${++x}. ${k.name} - **${k.plays}** plays`)
      .join(`\n`);
    const embed = new RichEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`Who knows ${artist.name} in ${message.member.guild.name}?`)
      .setDescription(description)
      .setFooter(`Command invoked by ${message.author.tag}`)
      .setTimestamp();
    await message.channel.send({embed});

    setTimeout(() => {
      client.cooldowns = client.cooldowns.filter(
        x => x.name !== this.help.name && x.userID === message.author.id
      );
    }, 8000);
  } catch (e) {
    if (e.apiError) {
      return message.channel.send(`API error occured while running the command. ` +
      `Please try again later.
Error code: ${e.info.code}
Error message: ${e.info.message}`);
    }
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `whoknows`,
  description: `Checks if anyone in a guild listens to a certain artist. If ` +
  `no artist is defined, the bot will try to look up an artist you are ` +
  `currently listening to.`,
  usage: `whoknows <artist name>`,
  notes: `This feature might be quite slow, because it sends a lot of API ` +
  `requests. Also, it only works in a guild.`
};
