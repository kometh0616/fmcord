module.exports = (message, user) => {
  if (message.mentions.users.first()) {
    return message.mentions.users.first();
  }
  const matchingFunctions = [
    member => member.user.tag.toLowerCase() === user.toLowerCase(),
    member => member.id === user,
    member => member.user.username.toLowerCase() === user.toLowerCase(),
    member => member.nickname && member.nickname.toLowerCase() === user.toLowerCase()
  ];
  for (const fn of matchingFunctions) {
    console.log(message.guild.members.some(fn));
    if (message.guild.members.some(fn)) {
      return message.guild.members.find(fn);
    }
  }
  return null;
};