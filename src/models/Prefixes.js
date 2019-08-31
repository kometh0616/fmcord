module.exports = (sequelize, DataTypes) => {
  const Prefixes = sequelize.define(`prefixes`, {
    guildID: {
      type: DataTypes.STRING,
      unique: true
    },
    prefix: {
      type: DataTypes.CHAR,
      length: 2
    }
  });
  return Prefixes;
};