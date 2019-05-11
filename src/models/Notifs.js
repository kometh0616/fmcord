module.exports = (sequelize, DataTypes) => {
  const Notifs = sequelize.define(`notifs`, {
    userID: DataTypes.STRING
  });
  return Notifs;
};
