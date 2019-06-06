const User = require(`./User.js`);
const Artist = require(`./Artist.js`);

class Library {
  constructor(apikey) {
    this.user = new User(apikey);
    this.artist = new Artist(apikey);
  }
}

module.exports = Library;
