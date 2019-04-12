const { google } = require(`googleapis`);
const { fetchtrack } = require(`../utils/fetchtrack`);

exports.run = async (client, message) => {
  try {
    var ft = new fetchtrack(client, message);
    var current = await ft.getcurrenttrack();

    if (current) {
      var yt = google.youtube({
        version: `v3`,
        auth: client.config.youtube.apikey
      });
      yt.search.list({
        part: `snippet`,
        q: `${current.artist[`#text`]} ${current.name}`
      }, function (err, result) {
        if (err) {
          console.error(`Error: ${err}`);
        }

        if (result && result.data.items.length > 0) {
          var top = result.data.items[0];
          var url = `https://youtu.be/${top.id.videoId}`;

          message.channel.send(`${message.author.username} is listening to ${current.name} by ${current.artist[`#text`]}: ${url}`);
        }
      });
    } else {
      await message.reply(client.snippets.notPlaying);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `ytnp`,
  description: `Gets a YouTube link of the current playing track`,
  usage: `ytnp`
};
