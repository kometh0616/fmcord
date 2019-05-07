const config = require(`./config.json`);

module.exports = {
  noLogin: `you haven't registered your Last.fm ` +
  `user account to this bot! Please do so with \`${config.prefix}` +
  `login <lastfm username>\` to be able to use this command!`,
  error: `There was an error trying to execute the ` +
  `command. Please try again later.`,
  github: `https://github.com/kometh0616/fmcord`,
  getSource: (cmd) => `https://github.com/kometh0616/fmcord/blob/master/src/commands/${cmd}.js`,
  notPlaying: `currently, you're not listening to anything.`,
  arrowLeft: `⬅`,
  arrowRight: `➡`,
  exit: `❌`,
};
