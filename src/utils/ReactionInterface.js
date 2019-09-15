
class ReactionInterface {
  constructor(message, author) {
    this.message = message;
    this.author = author;
    this.events = new Map();
    this.destroy = this.destroy.bind(this);
    this.timer = setTimeout(this.destroy, 30000);
    this.invoke = (reaction, user) => {
      const func = this.events.get(reaction.emoji.name);
      if (func && !user.bot) {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.destroy, 30000);
        func(reaction, user);
      }
    };
    this.message.client.on(`messageReactionAdd`, this.invoke);
    this.message.client.on(`messageReactionRemove`, this.invoke);
  }
  /**
  * Reacts to his own message with a defined key.
  * @param {string|Emoji|ReactionEmoji} key Reaction that will be added to the message.
  * @param {function} func A function that will be invoked on
  * clicking the key.
  */
  async setKey(key, func) {
    const eventFunc = (reaction, user) => {
      const messageCheck = this.author.id === user.id &&
      reaction.message.id === this.message.id;
      if (messageCheck) {
        func();
      }
    };
    this.events.set(key, eventFunc);
    await this.message.react(key);
  }
  /**
  * Removes all previously added listeners and deletes the message.
  */
  destroy() {
    clearTimeout(this.timer);
    this.events.clear();
    this.message.reactions.filter(x => x.me).forEach(x => x.remove());
    this.message.client.off(`messageReactionAdd`, this.invoke);
    this.message.client.off(`messageReactionRemove`, this.invoke);
  }
}

module.exports = ReactionInterface;
