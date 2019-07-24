const { readdir } = require(`fs`).promises;

exports.run = async (client, message, args) => {
  if (!args[0]) {
    return message.reply(`no command provided!`);
  }
  const root = `${process.env.PWD}/src/commands`;
  const cmdName = args[0];
  if (!client.commands.has(cmdName)) {
    const files = await readdir(root);
    console.log(files);
    const file = files.find(x => x === `${cmdName}.js`);
    if (!file) {
      return message.reply(`no file named \`${cmdName}.js\` found.`);
    }
    const props = require(`${root}/${cmdName}`);
    client.commands.set(cmdName, props);
    return message.reply(`command \`${cmdName}\` has been loaded succesfully!`);
  } else {
    delete require.cache[require.resolve(`${root}/${cmdName}.js`)];
    client.commands.delete(cmdName);
    const props = require(`${root}/${cmdName}`);
    client.commands.set(cmdName, props);
    await message.reply(`command \`${cmdName}\` has been reloaded succesfully!`);
  }
};