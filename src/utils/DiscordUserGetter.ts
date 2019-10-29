import { Message, GuildMember } from "discord.js";

export default (message: Message, user: string): GuildMember | null => {
    if (message.mentions.members.first()) {
        return message.mentions.members.first();
    } else {
        type MatchingFunction = (member: GuildMember) => boolean;
        const matchingFunctions: MatchingFunction[] = [
            (member: GuildMember): boolean => member.user.tag.toLowerCase() === user.toLowerCase(),
            (member: GuildMember): boolean => member.id === user,
            (member: GuildMember): boolean => member.user.username.toLowerCase() === user.toLowerCase(),
            (member: GuildMember): boolean => {
                if (member.nickname) {
                    return member.nickname.toLowerCase() === user.toLowerCase();
                } else {
                    return false;
                }
            }
        ];
        for (const fn of matchingFunctions) {
            if (message.guild.members.some(fn)) {
                return message.guild.members.find(fn);
            }
        }
        return null;
    }
};