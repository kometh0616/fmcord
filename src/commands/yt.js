const { google } = require(`googleapis`);

exports.run = async (client, message, args) => {
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
        var top = result.data.items[0];
        var url = `https://youtu.be/${top.id.videoId}`;

        message.reply(`Result for "**${args.join(` `)}**": ${url}`);
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
