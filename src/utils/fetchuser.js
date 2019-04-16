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
    return await this.getById(this.message.author.id);
  }

  async getById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user;
  }

  /**
   * Gets the lastFMUsername from the user object.
   */
  async username() {
    const user = await this.get();

    return (user) ? user.get(`lastFMUsername`) : null;
  }

  async usernameFromId(id) {
    const user = await this.getById(id);

    return (user) ? user.get(`lastFMUsername`) : null;
  }
}

module.exports.fetchuser = Fetchuser;
