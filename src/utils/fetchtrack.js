const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

/**
 * Fetches track info from LastFM.
 */
class Fetchtrack {
  constructor(client, message) {
    this.client = client;
    this.message = message;
    this.lib = new Library(client.config.lastFM.apikey);
  }

  /**
   * Gets the list of recently played tracks.
   */
  async getrecenttracks() {
    const user = new fetchuser(this.client, this.message);
    const username = await user.username();
    const data = await this.lib.user.getRecentTracks(username);

    return data.recenttracks;
  }

  /**
   * Gets the current playing track. Return false if nothing is playing.
   */
  async getcurrenttrack() {
    const recent = await this.getrecenttracks().then(r => r.track[0]);

    return (recent[`@attr`]) ? recent : false;
  }

  /**
   * Gets the last played track (will not get current track unless stopped)
   */
  async getlasttrack() {
    const recent = await this.getrecenttracks();
    const current = await this.getcurrenttrack();

    if (current) {
      return recent.track[1];
    } else {
      return recent.track[0];
    }
  }
}

module.exports.fetchtrack = Fetchtrack;
