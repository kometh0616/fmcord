const Client = require(`./Client.js`);

class Artist extends Client {
  constructor(apikey) {
    super(apikey);
  }
  getInfo(artist, username) {
    const query = this.stringify({
      method: `artist.getinfo`,
      artist: artist,
      username: username,
      api_key: this.apikey,
      format: `json`
    });
    return new Promise((resolve, reject) => {
      this.get(this.rootURL + query, res => {
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
  }
}

module.exports = Artist;
