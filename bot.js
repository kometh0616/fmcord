const http = require(`http`);
const express = require(`express`);
const fs = require(`fs`);
const { Client, Collection } = require(`discord.js`);
const DBL = require(`dblapi.js`);
let config;

const app = express();

app.get(`/`, (request, response) => {
  console.log(Date.now() + ` Ping Received`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

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
      setup();
    } catch (e) {
      console.error(`Oh no! Something went wrong!`);
      console.error(e);
    }
  })();
} else {
  config = require(`./config.json`);
  setup();
}

function setup() {
  const Sequelize = require(`sequelize`);

  const sequelize = new Sequelize(`database`, `user`, `password`, {
    host: `localhost`,
    dialect: `sqlite`,
    logging: false,
    storage: `.data/database.sqlite`
  });

  const client = new Client();
  client.config = config;
  client.commands = new Collection();
  client.cooldowns = [];
  client.sequelize = sequelize;
  client.snippets = require(`./snippets.js`);
  client.executing = new Set();

  if (process.argv[2] !== `--no-dbl` && config.dbl && config.dbl.apikey) {
    const dbl = new DBL(config.dbl.apikey, client);

    dbl.on(`posted`, () => {
      console.log(`Server count posted to discordbots.org!`);
    });

    dbl.on(`error`, e => {
      console.error(`DBL error: ${e}`);
    });
  }

  fs.readdir(`./src/commands/`, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      const fileName = file.split(`.`)[0];
      const props = require(`./src/commands/${file}`);
      client.commands.set(fileName, props);
    });
  });

  fs.readdir(`./src/events/`, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      const eventName = file.split(`.`)[0];
      const func = require(`./src/events/${file}`);
      client.on(eventName, func.bind(null, client));
    });
  });

  fs.readdir(`./src/models/`, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      const props = sequelize.import(`./src/models/${file}`);
      props.sync({ alter: true });
    });
  });

  process.on(`unhandledRejection`, console.error);

  client.login(config.discordToken)
    .then(console.log(`I'm in.`));
}

