const { google } = require(`googleapis`);

exports.run = async (client, message, args) => {
  if (args.length == 0) {
    return message.reply(`You need to input something to search`);
  }

  try {
    var yt = google.youtube({
      version: `v3`,
      auth: client.config.youtube.apikey
    });
    yt.search.list({
      part: `snippet`,
      q: args.join(` `)
    }, function (err, result) {
      if (err) {
        console.error(`Error: ${err}`);
      }

      if (result && result.data.items.length > 0) {
        for (var item of result.data.items) {
          if (item.id.kind === `youtube#video`) {
            var url = `https://youtu.be/${item.id.videoId}`;
            message.reply(`Result for "**${args.join(` `)}**": ${url}`);

            break;
          }
        }
      } else {
        message.reply(`No results for "${args.join(` `)}" found`);
      }
    });
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `yt`,
  description: `Gets a YouTube link of a searched song or video`,
  usage: `yt <search query>`
};
