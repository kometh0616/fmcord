const fs = require(`fs`);
const { ShardingManager } = require(`discord.js`);

let config;
if (!fs.existsSync(`./config.json`)) {
  const readline = require(`readline`);
  console.log(`No config.json file found! You will be asked a couple ` +
    `of questions to generate one. If you'd like to retry after failing, ` +
    `make sure to delete the old "config.json" file.`);
  const ri = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const file = fs.createWriteStream(`./config.json`);
  const question = text => new Promise(res => ri.question(text, res));
  (async () => {
    const prefix = await question(`What is your bot's prefix? `);
    file.write(`{"prefix":"${prefix}",`);
    const token = await question(`What is your bot's token? `);
    file.write(`"discordToken":"${token}",`);
    const lfmApiKey = await question(`Specify a Last.fm API key you'd like to use. `);
    file.write(`"lastFM":{"apikey":"${lfmApiKey}"},`);
    const useYT = await question(`Command "youtube" requires a YouTube API key. Would you like ` +
      `to specify one? [y/N] `);
    if (/^y/gi.test(useYT)) {
      const ytApiKey = await question(`Specify a YouTube API key you'd like to use. `);
      file.write(`"youtube":{"apikey":"${ytApiKey}"},`);
    }
    const userID = await question(`Command "admin" requires your ID in order to not let ` +
      `other users use those commands. Specify your user ID. `);
    file.write(`"botOwnerID":"${userID}"}`);
    try {
      config = require(`./config.json`);
      console.log(`You have succesfully set up a "config.json" file!`);
      console.log(`Continuing the work...`);
      setSharding();
    } catch (e) {
      console.error(`Oh no! Something went wrong!`);
      console.error(e);
    }
  })();
} else {
  config = require(`./config.json`);
  setSharding();
}

function setSharding() {
  const manager = new ShardingManager(`bot.js`, { token: config.discordToken });

  manager.spawn().catch(console.error);
  manager.on(`launch`, shard => console.log(`Launched shard ${shard.id}.`));
  
  manager.on(`message`, (shard, message) => {
    console.log(`Shard[${shard.id}] :`, message._eval, `:`, message._result);
    if (message._error) {
      console.error(message._error);
    }
  });
}
