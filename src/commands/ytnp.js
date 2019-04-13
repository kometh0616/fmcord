const { google } = require(`googleapis`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message) => {
  try {
    var user = new fetchuser(client, message);

    if (await user.get()) {
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
            for (var item of result.data.items) {
              if (item.id.kind === `youtube#video`) {
                var url = `https://youtu.be/${item.id.videoId}`;
                message.channel.send(`${message.author.username} is listening to ${current.name} by ${current.artist[`#text`]}: ${url}`);

                break;
              }
            }
          } else {
            message.reply(`Couldn't find a YouTube video for the track you're listening to.`);
          }
        });
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
  name: `ytnp`,
  description: `Gets a YouTube link of the current playing track`,
  usage: `ytnp`
};
