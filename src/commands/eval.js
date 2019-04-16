const { inspect } = require(`util`);
exports.run = (client, message, args) => {
  if (message.author.id !== client.config.botOwnerID) return;
  try {
    const code = args.join(` `);
    let evaled = eval(code);
    if (typeof evaled !== `string`)
      evaled = inspect(evaled);
    message.channel.send(evaled, {
      code: `js`,
      split: true
    });
  } catch (e) {
    console.log(e);
    message.channel.send(e, {
      code: `xl`,
      split: true
    });
  }
};
