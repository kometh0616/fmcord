module.exports = (sequelize, DataTypes) => {
  const Disables = sequelize.define(`disables`, {
    discordID: DataTypes.STRING,
    cmdName: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`discordID`, `cmdName`]
    }]
  });
  return Disables;
};
