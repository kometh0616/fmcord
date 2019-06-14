const Client = require(`./Client.js`);

class User extends Client {
  constructor(apikey) {
    super(apikey);
  }

  async getInfo(user) {
    const query = this.stringify({
      method: `user.getinfo`,
      user: user,
      api_key: this.apikey,
      format: `json`,
    });
    try {
      const data = await this.request(this.rootURL + query);
      return data;
    } catch (e) {
      throw e;
    }
  }

  async getTopAlbums(user, period = `overall`, limit = `50`, page = `1`) {
    const query = this.stringify({
      method: `user.gettopalbums`,
      user: user,
      period: period,
      limit: limit,
      page: page,
      api_key: this.apikey,
      format: `json`
    });
    try {
      const data = await this.request(this.rootURL + query);
      return data;
    } catch (e) {
      throw e;
    }
  }

  async getRecentTracks(user, from) {
    const query = this.stringify({
      method: `user.getrecenttracks`,
      user: user,
      from: from,
      api_key: this.apikey,
      format: `json`
    });
    try {
      const data = await this.request(this.rootURL + query);
      return data;
    } catch (e) {
      throw e;
    }
  }

  async getTopTracks(user, period = `overall`, limit = `50`, page = `1`) {
    const query = this.stringify({
      method: `user.gettoptracks`,
      user: user,
      period: period,
      limit: limit,
      page: page,
      api_key: this.apikey,
      format: `json`
    });
    try {
      const data = await this.request(this.rootURL + query);
      return data;
    } catch (e) {
      throw e;
    }
  }

  async getTopArtists(user, period = `overall`, limit = `50`, page = `1`) {
    const query = this.stringify({
      method: `user.gettopartists`,
      user: user,
      period: period,
      limit: limit,
      page: page,
      api_key: this.apikey,
      format: `json`
    });
    try {
      const data = await this.request(this.rootURL + query);
      return data;
    } catch (e) {
      throw e;
    }
  }

}

module.exports = User;
