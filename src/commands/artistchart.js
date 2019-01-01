const querystring = require(`querystring`);
const fetch = require(`node-fetch`);
const canvas = require(`canvas`);
canvas.registerFont(`${process.env.PWD}/helvetica.ttf`, {
  family: `helvetica`
});

exports.run = async (client, message, args) => {
  const usageWarning = `Incorrect usage of a command! Correct usage ` +
  `would be: \`&chart <time period> <grid size>\``;
  let period;

  switch (args[0]) {
  case `weekly`:
    period = `7day`;
    break;
  case `monthly`:
    period = `1month`;
    break;
  case `alltime`:
    period = `overall`;
    break;
  default:
    return message.channel.send(usageWarning);
  }

  if (!args[1]) return message.channel.send(usageWarning);

  const vals = args[1].split(`x`);
  if (vals === args[1] || vals.length !== 2)
    return message.channel.send(usageWarning);

  const axisArray = [parseInt(vals[0]), parseInt(vals[1])];
  if (axisArray.some(isNaN))
    return message.channel.send(usageWarning);


  const [x, y] = axisArray;
  if (x > 5 || y > 10) return message.channel.send(`The first number of ` +
  `the grid size must not be bigger than 5 tiles and the last number of ` +
  `the grid size must not be bigger than 10 tiles!`);

  const { botOwnerID } = client.config;
  const Users = client.sequelize.import(`../models/Users.js`);
  try {
    const user = await Users.findOne({
      where: {
        discordUserID: message.author.id,
      }
    });
    if (!user) return message.reply(`you haven't registered your Last.fm ` +
    `user account to this bot! Please do so with \`&login <lastfm username>\` ` +
    `to be able to use this command!`);
    await message.reply(`please wait until your grid is done...`);
    const query = querystring.stringify({
      method: `user.gettopartists`,
      user: user.get(`lastFMUsername`),
      period: period,
      limit: `${x*y}`,
      api_key: client.config.lastFM.apikey,
      format: `json`,
    });
    const endpoint = `http://ws.audioscrobbler.com/2.0/?`;
    const data = await fetch(endpoint + query).then(r => r.json());

    const { artist } = data.topartists;

    const canv = canvas.createCanvas(x*100, y*100);
    const ctx = canv.getContext(`2d`);

    const proms = [];
    artist.forEach(a => {
      if (a.image[3][`#text`] !== ``) {
        proms.push(canvas.loadImage(a.image[3][`#text`]));
      } else {
        proms.push(canvas.loadImage(`${process.env.PWD}/images/no_artist.png`));
      }
    });
    const imgs = await Promise.all(proms);

    let iter = 0;
    for (let yAxis = 0; yAxis < y * 100; yAxis += 100) {
      if (imgs[iter] !== undefined) {
        for (let xAxis = 0; xAxis < x * 100; xAxis += 100) {
          if (imgs[iter] !== undefined) {
            ctx.drawImage(imgs[iter], xAxis, yAxis, 100, 100);
            iter++;
          } else break;
        }
      } else break;
    }

    const names = [];
    artist.forEach(a => names.push(`${a.name} - ${a.playcount} plays`));
    let longestNum = -Infinity;
    let longestName;
    names.forEach(name => {
      if (longestNum < name.length) {
        longestNum = name.length;
        longestName = name;
      }
    });

    const { width } = ctx.measureText(longestName);
    const xAxis = x * 100 + 60 + width;
    let yAxis = y * 100;
    const finalCanvas = canvas.createCanvas(xAxis, yAxis);
    const fctx = finalCanvas.getContext(`2d`);
    fctx.fillStyle = `black`;
    fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    fctx.drawImage(canv, 0, 0);
    fctx.fillStyle = `white`;
    fctx.font = `12px helvetica`;
    let i = 0;
    for (let byChart = 0; byChart < 100 * y; byChart += 100) {
      for (let inChart = 15; inChart <= 15 * x; inChart += 15) {
        let yAxis = byChart + inChart;
        if (names[i] !== undefined)
          fctx.fillText(names[i], x * 100 + 15, yAxis);
        i++;
      }
    }

    const buffer = finalCanvas.toBuffer();
    await message.channel.send({file: buffer});

  } catch (e) {
    console.error(e);
    await message.channel.send(`<@${botOwnerID}>, something is NOT ok.`);
  }
};
