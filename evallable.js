(async () => {
  const { stringify } = require(`querystring`);
  const fetch = require(`node-fetch`);
  const canvas = require(`canvas`);
  const fs = require(`fs`);
  
  const stream = fs.createWriteStream(`./espAlbs.txt`);
  canvas.registerFont(`${process.env.PWD}/helvetica.ttf`, {
    family: `helvetica`
  });
  const query = stringify({
    method: `user.gettopalbums`,
    user: `GhostlyEspurr`,
    period: `7day`,
    limit: `30`,
    api_key: client.config.lastFM.apikey,
    format: `json`
  });

  const x = 5, y = 6;

  const endpoint = `http://ws.audioscrobbler.com/2.0/?`;
  const data = await fetch(endpoint + query).then(r => r.json());
  console.log(data);
  
  const { album } = data.topalbums;

  const canv = canvas.createCanvas(x*100, y*100);
  const ctx = canv.getContext(`2d`);

  const proms = [];
  const links = [];
  let hiccedAt = 0;
  album.forEach(a => {
    if (a.image[3][`#text`].startsWith(`https://`)) {
      stream.write(`${a.image[3][`#text`]}\n`);
      proms.push(canvas.loadImage(a.image[3][`#text`]));
    } else {
      proms.push(canvas.loadImage(`${process.env.PWD}/images/no_album.png`));
    }
  });
})();