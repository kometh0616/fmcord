const { readdir } = require(`fs`).promises;

exports.run = async (client, message, args) => {
  try {
    if (message.author.id !== client.config.botOwnerID) return;
    if (args.length === 0) return message.reply(`please specify an admin ` +
    `command you want to use!`);
    const cmdName = args[0].toLowerCase();
    const dir = `${process.env.PWD}/src/commands/admin/`;
    const files = await readdir(dir);
    const command = files.find(x => x.startsWith(cmdName));
    if (!command) return message.reply(`no command named \`${args[0]}\` found.`);
    const cmd = require(`./admin/${command}`);
    const cmdArgs = args.slice(1);
    cmd.run(client, message, cmdArgs);
  } catch (e) {
    console.log(e);
    await message.channel.send(client.snippets.error);
  }
};
