const { stringify } = require(`querystring`);
const { get } = require(`https`);

class LastFMClient {
  constructor(apikey) {
    this.apikey = apikey;
    this.rootURL = `https://ws.audioscrobbler.com/2.0/?`;
    this.stringify = stringify;
    this.get = get;
  }
}

module.exports = LastFMClient;
