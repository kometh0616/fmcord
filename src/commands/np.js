const Library = require(`../lib/index.js`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);


exports.run = async (client, message) => {
  try {
    const lib = new Library(client.config.lastFM.apikey);
    const user = new fetchuser(client, message);

    if (await user.get()) {
      const ft = new fetchtrack(client, message);
      const track = await ft.getcurrenttrack(client, message);

      if (track) {
        const prevTrack = await ft.getlasttrack(client, message);
        const username = await user.username();
        const userData = await lib.user.getInfo(username);
        const embed = new RichEmbed()
          .addField(`Current:`, `**${track.name}** - ${track.artist[`#text`]} ` +
            `| ${track.album[`#text`] ? track.album[`#text`] : `no album`}`)
          .addField(`Previous:`,
            `**${prevTrack.name}** - ${prevTrack.artist[`#text`]} | ` +
            `${prevTrack.album[`#text`] ? prevTrack.album[`#text`] : `no album`}`)
          .setColor(message.member.displayColor)
          .setTitle(`Last tracks from ${username}`)
          .setURL(userData.user.url)
          .setThumbnail(track.image[2][`#text`])
          .setFooter(`Command invoked by ${message.author.tag} with a total ` +
            `of ${userData.user.playcount} scrobbles.`)
          .setTimestamp();
        const msg = await message.channel.send({ embed });
        await msg.react(`✅`);
        await msg.react(`❌`);
      } else {
        await message.reply(client.snippets.notPlaying);
      }
    } else {
      await message.reply(client.snippets.noLogin);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `np`,
  description: `Shows you a song you are listening to right now.`,
  usage: `np`
};
