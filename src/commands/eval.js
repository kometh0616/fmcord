const { inspect } = require(`util`);
exports.run = async (client, message, args) => {
  if (message.author.id !== client.config.botOwnerID) return;
  const code = args.join(` `);
  let evaled = eval(code);
  if (typeof evaled !== `string`)
    evaled = inspect(evaled);
  try {
    await message.channel.send(evaled, {
      code: `js`,
      split: true
    });
  } catch (e) {
    console.log(e);
    message.reply(e, {code: `js`, split: true});
  }
};
