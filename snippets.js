/* eslint-disable */

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
  npNoLogin: `you haven't registered your Last.fm ` +
  `account, therefore, I can't check what you're listening to. To set ` +
  `your Last.fm nickname, do \`${config.prefix}login <lastfm username>\`.`,
  arrowLeft: `⬅`,
  arrowRight: `➡`,
  exit: `❌`,
  dBotsLink: `https://discordbots.org/bot/521041865999515650`,
  commonReasons: {
    noLogin: `Message author wasn't logged in.`,
    notPlaying: `No currently playing track found.`,
    noArtist: `No artist provided by the message author.`,
    noUsername: `No username provided by the message author`,
  }
};
