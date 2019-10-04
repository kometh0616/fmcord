const Client = require(`./Client`);

class Track extends Client {
  
  constructor(apikey) {
    super(apikey);
  }

  async getInfo({ artist, mbid, track, username }) {
    const query = this.stringify({
      method: `track.getinfo`,
      artist, mbid, track, username,
      api_key: this.apikey,
      format: `json`
    });
    const data = await this.request(this.rootURL + query);
    return data;
  }

}

module.exports = Track;