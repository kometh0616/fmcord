/**
 * Gets the user from the database.
 */
class Fetchuser {
  constructor(client, message) {
    this.client = client;
    this.message = message;
  }

  /**
   * Gets the user object from the database.
   */
  async get() {
    var Users = this.client.sequelize.import(`../models/Users.js`);
    var user = await Users.findOne({
      where: {
        discordUserID: this.message.author.id
      }
    });

    if (!user) {
      return this.message.reply(this.client.snippets.noLogin);
    }

    return user;
  }

  /**
   * Gets the lastFMUsername from the user object.
   */
  async username() {
    return (await this.get()).get(`lastFMUsername`);
  }
}

module.exports.fetchuser = Fetchuser;
