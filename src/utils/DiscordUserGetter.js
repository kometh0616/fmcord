module.exports = (message, user) => {
  if (message.mentions.members.first()) {
    return message.mentions.members.first();
  }
  const matchingFunctions = [
    member => member.user.tag.toLowerCase() === user.toLowerCase(),
    member => member.id === user,
    member => member.user.username.toLowerCase() === user.toLowerCase(),
    member => member.nickname && member.nickname.toLowerCase() === user.toLowerCase()
  ];
  for (const fn of matchingFunctions) {
    if (message.guild.members.some(fn)) {
      return message.guild.members.find(fn).user;
    }
  }
  return null;
};