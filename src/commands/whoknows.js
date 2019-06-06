const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { Op } = require(`sequelize`);
const Library = require(`../lib/index.js`);

const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);

exports.run = async (client, message, args) => {
  const isCooled = client.cooldowns.find(
    x => x.name === this.help.name && x.userID === message.author.id
  );
  if (isCooled)
    return message.reply(`this command is on a cooldown due to overusage. ` +
    `Please wait 8 seconds before you can use it again.`);
  const fetchUser = new fetchuser(client, message);
  const fetchTrack = new fetchtrack(client, message);
  const lib = new Library(client.config.lastFM.apikey);
  try {
    const Users = client.sequelize.import(`../models/Users.js`);
    const Crowns = client.sequelize.import(`../models/Crowns.js`);
    const Notifs = client.sequelize.import(`../models/Notifs.js`);
    let artistName = args.join(` `);
    const user = await fetchUser.username();
    if (!artistName) {
      if (!user) return message.reply(`you haven't registered your Last.fm ` +
      `account, therefore, I can't check what you're listening to. To set ` +
      `your Last.fm nickname, do \`&login <lastfm username>\`.`);
      const track = await fetchTrack.getcurrenttrack();
      if (!track[`@attr`])
        return message.reply(`currently, you are not listening to anything.`);
      else artistName = track.artist[`#text`];
    }
    const know = [];
    const data = await lib.artist.getInfo(artistName);

    if (!data.artist) return message.reply(`there is no such artist as ` +
    `\`${artistName}\` in Last.fm.`);

    const guild = await message.guild.fetchMembers();

    for (const [id, member] of guild.members) {
      const user = await fetchUser.usernameFromId(id);
      if (!user) continue;
      const req = await lib.artist.getInfo(artistName, user);

      if (!req.artist.stats.userplaycount) continue;

      const data = {
        name: member.user.username,
        userID: member.user.id,
        plays: req.artist.stats.userplaycount
      };
      know.push(data);
    }

    // Giving a top-ranking listener in the guild his crown, if he still has none.
    const sorted = know.sort(sortingFunc)[0];
    const hasCrown = await Crowns.findOne({
      where: {
        guildID: message.guild.id,
        artistName: data.artist.name
      }
    });

    if (hasCrown === null && sorted.plays !== `0`) {
      await Crowns.create({
        guildID: message.guild.id,
        userID: sorted.userID,
        artistName: data.artist.name,
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
      if (parseInt(plays) < parseInt(sorted.plays)) {
        await Crowns.update({
          userID: sorted.userID,
          artistPlays: sorted.plays,
        },
        {
          where: {
            guildID: message.guild.id,
            artistName: data.artist.name,
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
          artist: data.artist.name
        });
      }
    }

    if (know.length === 0 || know.every(x => x.plays === `0`))
      return message.reply(`no one here listens to ${data.artist.name}.`);
    know.sort(sortingFunc);
    let x = 0;
    const description = know
      .sort(sortingFunc)
      .slice(0, 10)
      .filter(k => k.plays !== `0`)
      .map(k => `${++x}. ${k.name} - **${k.plays}** plays`)
      .join(`\n`);
    const embed = new RichEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`Who knows ${data.artist.name} in ${message.member.guild.name}?`)
      .setDescription(description)
      .setFooter(`Command invoked by ${message.author.tag}`)
      .setTimestamp();
    await message.channel.send({embed});
    client.cooldowns.push({
      name: this.help.name,
      userID: message.author.id,
    });
    setTimeout(() => {
      client.cooldowns = client.cooldowns.filter(
        x => x.name !== this.help.name && x.userID === message.author.id
      );
    }, 8000);
  } catch (e) {
    if (e.name !== `SequelizeUniqueConstraintError`) {
      console.error(e);
      await message.channel.send(client.snippets.error);
    }
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
