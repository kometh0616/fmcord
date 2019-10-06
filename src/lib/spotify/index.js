const https = require(`https`);
const { stringify } = require(`querystring`);
/**
 * A class used for fetching information from Spotify.
 * @public
 */

class Spotify {

  constructor(id, secret) {
    if (!id || !secret) {
      throw new Error(`No credentials are provided.`);
    }
    this.id = id;
    this.secret = secret;
  }

  /**
   * A method used to get access token.
   * @private
   */
  getToken() {
    const query = stringify({
      grant_type: `client_credentials`
    });
    const reqOpts = {
      hostname: `accounts.spotify.com`,
      path: `/api/token`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.id}:${this.secret}`).toString(`base64`)}`,
        'Content-Type': `application/x-www-form-urlencoded`,
      },
      method: `POST`
    };
    return new Promise((resolve, reject) => {
      const req = https.request(reqOpts, res => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          reject(new Error(`Request failed. Status code: ${statusCode}`));
        }
        let rawData = ``;
        res.on(`data`, chunk => rawData += chunk);
        res.on(`end`, () => {
          try {
            const data = JSON.parse(rawData);
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on(`error`, reject);
      req.write(query);
      req.end();
    });
  }
  
  async request(url) {
    const token = await this.getToken();
    const reqOpts = {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    };
    return new Promise((resolve, reject) => {
      https.get(url, reqOpts, res => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          reject(new Error(`Request failed. Status code: ${statusCode}`));
        }
        let rawData = ``;
        res.on(`data`, chunk => rawData += chunk);
        res.on(`end`, () => {
          try {
            const data = JSON.parse(rawData);
            resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }).on(`error`, reject);
    });
  }

  /**
   * Tries to find a track. 
   * Returns a track.
   * @param {string} q Name of the track you are looking for.
   */
  async findTrack(q) {
    try {
      const query = stringify({
        q, type: `track`
      });
      const url = `https://api.spotify.com/v1/search?${query}`;
      const data = await this.request(url);
      return data;
    } catch (e) {
      throw new Error(`Got an error: ${e}`);
    }
  }

}

module.exports = Spotify;