const { inspect } = require(`util`);
exports.run = async (client, message, args) => {
  try {
    const code = args.join(` `);
    let evaled = eval(code);
    if (typeof evaled !== `string`)
      evaled = inspect(evaled);
    await message.channel.send(evaled, {
      code: `js`,
      split: true
    });
  } catch (e) {
    console.log(e);
    await message.channel.send(e, {
      code: `xl`,
      split: true
    });
  }
};
