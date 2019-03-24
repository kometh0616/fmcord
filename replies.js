const config = require(`./config.json`);

module.exports = {
  noLogin: `you haven't registered your Last.fm ` +
  `user account to this bot! Please do so with \`${config.prefix}` +
  `login <lastfm username>\` to be able to use this command!`,
  error: `There was an error trying to execute the ` +
  `command. Please try again later.`
};
