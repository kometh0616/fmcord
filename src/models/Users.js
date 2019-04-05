module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(`users`, {
    discordUserID: DataTypes.STRING,
    lastFMUsername: DataTypes.STRING,
    lastDailyTimestamp: DataTypes.DATE,
    dailyPlayCount: DataTypes.INTEGER,
  });
  return Users;
};
