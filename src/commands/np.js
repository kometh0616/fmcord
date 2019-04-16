const { stringify } = require(`querystring`);
const fetch = require(`node-fetch`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);


exports.run = async (client, message) => {
  try {
    const { apikey, endpoint } = client.config.lastFM;
    const user = new fetchuser(client, message);

    if (await user.get()) {
      const ft = new fetchtrack(client, message);
      const track = await ft.getcurrenttrack(client, message);

      if (track) {
        const prevTrack = await ft.getlasttrack(client, message);
        const query = stringify({
          method: `user.getinfo`,
          user: await user.username(),
          api_key: apikey,
          format: `json`
        });

        const userData = await fetch(endpoint + query).then(r => r.json());
        const embed = new RichEmbed()
          .addField(`Current:`, `**${track.name}** - ${track.artist[`#text`]} ` +
            `| ${track.album[`#text`] ? track.album[`#text`] : `no album`}`)
          .addField(`Previous:`,
            `**${prevTrack.name}** - ${prevTrack.artist[`#text`]} | ` +
            `${prevTrack.album[`#text`] ? prevTrack.album[`#text`] : `no album`}`)
          .setColor(message.member.displayColor)
          .setTitle(`Last tracks from ${await user.username()}`)
          .setURL(userData.user.url)
          .setThumbnail(track.image[2][`#text`])
          .setFooter(`Command invoked by ${message.author.tag} with a total ` +
            `of ${userData.user.playcount} scrobbles.`)
          .setTimestamp();
        await message.channel.send({ embed });
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
