const { writeFile, unlink } = require(`fs`).promises;

exports.run = async (client, message) => {
  try {
    let num = 0;
    const path = `${process.env.PWD}/res.txt`;
    const guilds = await client.shard.broadcastEval(`
      this.guilds.sort((a, b) => b.memberCount - a.memberCount)
        .map(x => x.name + ' with ' + x.memberCount + ' members')
    `);
    const list = guilds
      .flat()
      .map(x => `${++num}. ${x}`)
      .join(`\r\n`);
    await writeFile(path, list);
    await message.channel.send({ files: [{
      attachment: path,
      name: `guildlist.txt`,
    }]});
    await unlink(path);
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};
