const http = require(`http`);
const express = require(`express`);
const fs = require(`fs`);
const DBL = require(`dblapi.js`);
const { Client, Collection } = require(`discord.js`);
const config = require(`./config.json`);

const app = express();

app.get(`/`, (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

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

if (config.dbl && config.dbl.apikey) {
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

