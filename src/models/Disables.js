module.exports = (sequelize, DataTypes) => {
  const Disables = sequelize.define(`disables`, {
    discordID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cmdName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [{
      unique: true,
      fields: [`discordID`, `cmdName`]
    }]
  });
  return Disables;
};
