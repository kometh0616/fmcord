module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(`users`, {
    discordUserID: DataTypes.STRING,
    lastFMUsername: DataTypes.STRING
  });
  return Users;
};
