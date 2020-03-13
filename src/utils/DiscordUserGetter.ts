import { Message, Member } from "eris";

export default (message: Message, user: string): Member | null => {
    if (message.mentions[0] !== undefined) {
        const member = message.member?.guild.members.find(m => m.id === message.mentions[0].id);
        return member ?? null;
    } else {
        type MatchingFunction = (member: Member) => boolean;
        const matchingFunctions: MatchingFunction[] = [
            (member: Member): boolean => member.username.toLowerCase() === user.toLowerCase(),
            (member: Member): boolean => member.id === user,
            (member: Member): boolean => `${member.username.toLowerCase()}#${member.discriminator}` === user.toLowerCase(),
            (member: Member): boolean => member.nick?.toLowerCase() === user.toLowerCase()
        ];
        for (const fn of matchingFunctions) {
            const member = message.member?.guild.members.find(fn);
            if (member !== undefined) {
                return member;
            }
        }
        return null;
    }
};