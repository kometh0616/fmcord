(async () => {
  const { stringify } = require(`querystring`);
  const fetch = require(`node-fetch`);
  const canvas = require(`canvas`);
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
  album.forEach(a => {
    
    if (a.image[3][`#text`] !== ``) {
      proms.push(canvas.loadImage(a.image[3][`#text`]));
    } else {
      proms.push(canvas.loadImage(`${process.env.PWD}/images/no_album.png`));
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
  album.forEach(a => names.push(`${a.artist.name} - ${a.name}`));
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

})();