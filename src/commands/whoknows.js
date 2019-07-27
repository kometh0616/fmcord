const Command = require(`../classes/Command`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { Op } = require(`sequelize`);
const Library = require(`../lib/index.js`);

const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);

class WhoKnowsCommand extends Command {

  constructor() {
    super({
      name: `whoknows`,
      description: `Checks if anyone in a guild listens to a certain artist. If ` +
      `no artist is defined, the bot will try to look up an artist you are ` +
      `currently listening to.`,
      usage: `whoknows <artist name>`,
      notes: `This feature might be quite slow, because it sends a lot of API ` +
      `requests. Also, it only works in a guild.`,
      cooldown: 10,
      aliases: [`w`]
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const fetchUser = new fetchuser(client, message);
      const fetchTrack = new fetchtrack(client, message);
      const lib = new Library(client.config.lastFM.apikey);
      const Users = client.sequelize.import(`../models/Users.js`);
      const Crowns = client.sequelize.import(`../models/Crowns.js`);
      const Notifs = client.sequelize.import(`../models/Notifs.js`);
      let artistName = args.join(` `);
      const user = await fetchUser.username();
      if (!artistName) {
        if (!user) {
          await message.reply(client.snippets.npNoLogin);
          this.context.reason = client.snippets.commonReasons.noLogin;
          throw this.context;
        }
        const track = await fetchTrack.getcurrenttrack();
        if (!track[`@attr`]) {
          await message.reply(client.snippets.notPlaying);
          this.context.reason = client.snippets.commonReasons.notPlaying;
          throw this.context;
        } else {
          artistName = track.artist[`#text`];
        }
      }
      const know = [];
      const data = await lib.artist.getInfo(artistName);

      if (!data.artist) {
        await message.reply(`there is no such artist as \`${artistName}\` ` +
        `in Last.fm.`);
        this.context.reason = `No such artist found on Last.fm`;
        throw this.context;
      }

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

      if (know.length === 0 || know.every(x => x.plays === `0`)) {
        await message.reply(`no one here listens to ${data.artist.name}.`);
        this.context.reason = `No listeners of the artist found.`;
        throw this.context;
      }
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
        .setURL(data.artist.url)
        .setDescription(description)
        .setFooter(`Command invoked by ${message.author.tag}`)
        .setTimestamp();
      await message.channel.send({embed});
      return this.context;
    } catch (e) {
      if (e.name !== `SequelizeUniqueConstraintError`) {
        this.context.stack = e.stack;
        throw this.context;
      }
    }
  }

}

module.exports = WhoKnowsCommand;
