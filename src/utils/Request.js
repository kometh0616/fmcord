const { stringify } = require(`querystring`);
const { apikey } = require(`../../config.json`).lastFM;
const { get } = require(`https`);
const endpoint = `https://ws.audioscrobbler.com/2.0/?`;

module.exports = params => {
  params.api_key = apikey;
  params.format = `json`;
  const query = stringify(params);
  return new Promise((resolve, reject) => {
    get(endpoint + query, res => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        reject(new Error(`Request failed. Status code: ${statusCode}`));
      }
      let rawData = ``;
      res.on(`data`, chunk => rawData += chunk);
      res.on(`end`, () => {
        try {
          const data = JSON.parse(rawData);
          if (data.error) {
            reject(new Error(`${data.message}`));
          }
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    }).on(`error`, reject);
  });
};
