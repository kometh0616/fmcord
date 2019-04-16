const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = (args[0]) ? message.mentions.users.first() : message.author;

  if (discordUser !== undefined) {
    const user = await fuser.getById(discordUser.id);

    if (user) {
      await message.channel.send(`\`${discordUser.username}'s\` LastFM URL is: https://last.fm/user/${user.get(`lastFMUsername`)}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into LastFM.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `lfm`,
  description: `Gets the LastFM URL of you or a given user.`,
  usage: `lfm [Discord User]`,
  notes: `The looked up user must be logged in to LastFM with the bot.`
};
