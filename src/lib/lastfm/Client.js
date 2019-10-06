const { stringify } = require(`querystring`);
const { get } = require(`https`);

class LastFMClient {
  constructor(apikey) {
    this.apikey = apikey;
    this.rootURL = `https://ws.audioscrobbler.com/2.0/?`;
    this.stringify = stringify;
    this.get = get;
  }
  request(url) {
    return new Promise((resolve, reject) => {
      get(url, res => {
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
              reject(new Error(data.message));
            }
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }).on(`error`, reject);
    });
  }
}

module.exports = LastFMClient;
