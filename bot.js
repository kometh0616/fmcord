const http = require(`http`);
const express = require(`express`);
const fs = require(`fs`);
const { Client, Collection } = require(`discord.js`);
const config = require(`./config.json`);
const bodyParser = require(`body-parser`);

const app = express();
const dbl = express();

app.get(`/`, (request, response) => {
  console.log(Date.now() + ` Ping Received`);
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
  storage: `database.sqlite`
});

const client = new Client();
client.config = config;
client.commands = new Collection();
client.sequelize = sequelize;
client.snippets = require(`./snippets.js`);

const port = `5000`;
dbl.use(bodyParser.json());
dbl.use(bodyParser.urlencoded({ extended: true }));

dbl.post(`/dblwebhook`, (req, res) => {
  const { body, headers } = req;
  if (headers && headers.authorization === config.dbl.webhookPass) {
    res.status(200).send();
    let text = `User with ID ${body.user} voted in discordbots.org ` +
  `at ${new Date().toUTCString()}. Vote type is ${body.type}.`;
    if (body.isWeekend) text += ` Weekend multiplier applies.`;
    fs.writeFile(`votelog.txt`, `${text}\n`, err => {
      if (err) throw err;
      console.log(`discordbots.org vote registered.`);
    });
  } else res.status(403).send();
});

dbl.listen(port, () => {
  console.log(`Listening for port ${port}...`);
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
