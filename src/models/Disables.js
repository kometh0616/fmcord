module.exports = (sequelize, DataTypes) => {
  const Disables = sequelize.define(`disables`, {
    guildID: DataTypes.STRING,
    channelID: DataTypes.STRING,
    cmdName: DataTypes.STRING,
    guildDisabled: DataTypes.BOOLEAN
  });
  return Disables;
};
