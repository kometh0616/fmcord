const http = require(`http`);
const express = require(`express`);
const app = express();
const server = http.createServer(app);
app.get(`/`, (request, response) => {
  console.log(Date.now() + ` Ping Received`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const fs = require(`fs`);
const { Client, Collection } = require(`discord.js`);
const config = require(`./config.json`);
const Sequelize = require(`sequelize`);
const DBL = require(`dblapi.js`);

const sequelize = new Sequelize(`database`, `user`, `password`, {
  host: `localhost`,
  dialect: `sqlite`,
  logging: false,
  storage: `database.sqlite`
});

const client = new Client();
client.config = config;
client.commands = new Collection();
client.sequelize = sequelize;
client.snippets = require(`./snippets.js`);

const dbl = new DBL(client.config.dbl.apikey, {
  webhookAuth: client.config.dbl.webhookPass,
  webhookServer: server
}, client);

dbl.webhook.on(`ready`, hook => {
  console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
});

dbl.webhook.on(`vote`, vote => {
  let text = `User with ID ${vote.user} voted in discordbots.org ` +
  `at ${new Date().toUTCString()}. Vote type is ${vote.type}.`;
  if (vote.isWeekend) text += ` Weekend multiplier applies.`;
  fs.writeFile(`votelog.txt`, `${text}\n`, err => {
    if (err) throw err;
    console.log(`discordbots.org vote registered.`);
  });
});

server.listen(5000, () => {
  console.log(`Listening to port 5000...`);
});

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
    props.sync();
  });
});

process.on(`unhandledRejection`, console.error);

client.login(config.discordToken)
  .then(console.log(`I'm in.`));
