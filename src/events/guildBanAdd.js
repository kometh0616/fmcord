module.exports = async (client, guild, user) => {
  const Crowns = client.sequelize.model(`crowns`);
  try {
    const amount = await Crowns.destroy({
      where: {
        guildID: guild.id,
        userID: user.id
      }
    });
    console.log(`${user.tag} was banned from ${guild.name}. ${amount} crowns were ` +
    `removed from them.`);
  } catch (e) {
    throw new Error(`Error while removing crowns after a ban: ${e.message}`);
  }
};