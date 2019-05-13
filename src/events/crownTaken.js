const fetch = require(`node-fetch`);
const { stringify } = require(`querystring`);

module.exports = async (client, ctx) => {
  const { apikey, endpoint } = client.config.lastFM;
  const Users = client.sequelize.import(`../models/Users.js`);
  try {
    if (ctx.prevOwner !== ctx.newOwner) {
      const prevUser = {
        discord: client.users.get(ctx.prevOwner),
        local: await Users.findOne({
          where: {
            discordUserID: ctx.prevOwner
          }
        })
      };
      const newUser = {
        discord: client.users.get(ctx.newOwner),
        local: await Users.findOne({
          where: {
            discordUserID: ctx.newOwner
          }
        })
      };
      const prevParams = {
        method: `artist.getinfo`,
        artist: ctx.artist,
        username: prevUser.local.get(`lastFMUsername`),
        api_key: apikey,
        format: `json`
      };
      const prevQuery = stringify(prevParams);
      const newParams = Object.assign({}, prevParams);
      newParams.username = newUser.local.get(`lastFMUsername`);
      const newQuery = stringify(newParams);
      const prevFetch = await fetch(endpoint + prevQuery).then(r => r.json());
      const newFetch = await fetch(endpoint + newQuery).then(r => r.json());
      const prevPlays = prevFetch.artist.stats.userplaycount;
      const newPlays = newFetch.artist.stats.userplaycount;
      const dmChannel = await prevUser.discord.createDM();
      await dmChannel.send(`You have lost your **${ctx.artist}** crown ` +
      `in **${ctx.guild}** to **${newUser.discord.tag}**.\nYour play count: ` +
      `\`${prevPlays}\`\nTheir play count: \`${newPlays} ` +
      `\``);
    }
  } catch (e) {
    console.error(e);
    const owner = client.users.get(client.config.botOwnerID);
    const dmChannel = await owner.createDM();
    await dmChannel.send(`Error at the event.`);
  }
};
