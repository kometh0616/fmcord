class Command {
  constructor(props) {
    this.name = props.name;
    this.description = props.description;
    this.aliases = props.aliases ? props.aliases : [];
    this.usage = props.usage;
    this.notes = props.notes;
    // Cooldown will be needed to be defined in seconds
    this.cooldown = props.cooldown * 1000;
    this.dmAvailable = props.dmAvailable ? props.dmAvailable : false;
    this.permissions = props.permissions ? props.permissions : {
      user: 0,
      bot: 0,
    };
    this.helpExempt = props.helpExempt ? props.helpExempt : false;
    this.botOwnerOnly = props.botOwnerOnly ? props.botOwnerOnly : false;
  }
  /**
   * @param {Message} message A Discord message to generate context from.
   */
  setContext(message) {
    this.context = {
      /* isContext property is needed for checking if an error thrown at the
      message event was a command context. */
      isContext: true,
      name: this.name,
      author: message.author,
      timestamp: new Date().toUTCString(),
      channel: message.channel,
      message: message
    };
    if (message.channel.type === `text`) {
      this.context.guild = message.guild;
    }
  }
}

module.exports = Command;
