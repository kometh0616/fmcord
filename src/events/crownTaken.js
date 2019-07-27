const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

module.exports = async (client, ctx) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, null);
  try {
    if (ctx.prevOwner !== ctx.newOwner) {
      const prevUser = {
        discord: await client.fetchUser(ctx.prevOwner),
        local: await fetchUser.usernameFromId(ctx.prevOwner)
      };
      const newUser = {
        discord: await client.fetchUser(ctx.newOwner),
        local: await fetchUser.usernameFromId(ctx.newOwner)
      };
      const prevFetch = await lib.artist.getInfo(ctx.artist, prevUser.local);
      const newFetch = await lib.artist.getInfo(ctx.artist, newUser.local);
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
    const owner = await client.fetchUser(client.config.botOwnerID);
    const dmChannel = await owner.createDM();
    await dmChannel.send(`Error at the event.`);
  }
};
