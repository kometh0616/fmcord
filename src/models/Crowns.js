module.exports = (sequelize, DataTypes) => {
  const Crowns = sequelize.define(`crowns`, {
    guildID: {
      type: DataTypes.STRING,
      unique: `crown`
    },
    userID: {
      type: DataTypes.STRING,
      unique: `crown`
    },
    artistName: {
      type: DataTypes.STRING,
      unique: `crown`
    },
    artistPlays: DataTypes.STRING
  });
  return Crowns;
};
