const { stringify } = require(`querystring`);
const fetch = require(`node-fetch`);
const { fetchuser } = require(`../utils/fetchuser`);

/**
 * Fetches track info from LastFM.
 */
class Fetchtrack {
  constructor(client, message) {
    this.client = client;
    this.message = message;
  }

  /**
   * Gets the list of recently played tracks.
   */
  async getrecenttracks() {
    var user = new fetchuser(this.client, this.message);
    var { apikey, endpoint } = this.client.config.lastFM;

    var query = stringify({
      method: `user.getrecenttracks`,
      user: await user.username(),
      api_key: apikey,
      format: `json`
    });
    var data = await fetch(endpoint + query).then(r => r.json());

    return data.recenttracks;
  }

  /**
   * Gets the current playing track. Return false if nothing is playing.
   */
  async getcurrenttrack() {
    var recent = await this.getrecenttracks().then(r => r.track[0]);

    return (recent[`@attr`]) ? recent : false;
  }

  /**
   * Gets the last played track (will not get current track unless stopped)
   */
  async getlasttrack() {
    var recent = await this.getrecenttracks();
    var current = await this.getcurrenttrack();

    if (current) {
      return recent.track[1];
    } else {
      return recent.track[0];
    }
  }
}

module.exports.fetchtrack = Fetchtrack;
