const Client = require(`./Client.js`);

class User extends Client {
  constructor(apikey) {
    super(apikey);
  }

  getInfo(user) {
    const query = this.stringify({
      method: `user.getinfo`,
      user: user,
      api_key: this.apikey,
      format: `json`,
    });
    return new Promise((resolve, reject) => {
      this.get(this.rootURL + query, res => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          reject(new Error(`Request failed: Status code: ${statusCode}`));
        }
        let rawData = ``;
        res.on(`data`, chunk => rawData += chunk);
        res.on(`end`, () => {
          try {
            const data = JSON.parse(rawData);
            if (data.error) {
              reject(new Error(`${data.error.message}`));
            }
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }).on(`error`, reject);
    });
  }

  getTopAlbums(user, period = `overall`, limit = `50`, page = `1`) {
    const query = this.stringify({
      method: `user.gettopalbums`,
      user: user,
      period: period,
      limit: limit,
      page: page,
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
              reject(new Error(`${data.error.message}`));
            }
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }).on(`error`, reject);
    });
  }

  getRecentTracks(user, from) {
    const query = this.stringify({
      method: `user.getrecenttracks`,
      user: user,
      from: from,
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
              reject(new Error(`${data.error.message}`));
            }
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }).on(`error`, reject);
    });
  }

  getTopTracks(user, period = `overall`, limit = `50`, page = `1`) {
    const query = this.stringify({
      method: `user.gettoptracks`,
      user: user,
      period: period,
      limit: limit,
      page: page,
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
              reject(new Error(`${data.error.message}`));
            }
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }).on(`error`, reject);
    });
  }

  getTopArtists(user, period = `overall`, limit = `50`, page = `1`) {
    const query = this.stringify({
      method: `user.gettopartists`,
      user: user,
      period: period,
      limit: limit,
      page: page,
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
              reject(new Error(`${data.error.message}`));
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

module.exports = User;
