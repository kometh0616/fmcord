import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import FMcordEmbed from "../classes/FMcordEmbed";
import NotDisabled from "../checks/NotDisabled";
import PostCheck from "../hooks/PostCheck";

export default class OneThousandCommand extends CommandParams {

    public constructor() {
        super(`1000`, {
            description: `Shows you a list of songs that were submitted in ` +
            `FMcord's 1000 server milestone event.`,
            usage: `1000`,
            fullDescription: `Thanks to everyone who participated. You have a gratitude ` +
            `of every person behind FMcord.`,
            requirements: {
                custom: NotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message): Promise<void> {
        const servers = new Map<string, string[]>();
        servers.set(`Server`, [
            `Garden of Shadows - Oracle Moon - Twilight Odyssey`,
            `Mortician - Hacked Up For Barbeque - Necrocannibal`,
            `Snollebollekes - En Door... - Lekker Likkie`
        ]);
        servers.set(`Iron Maiden`, [
            `Iron Maiden - The Number of the Beast - Hallowed Be Thy Name`,
            `Iron Maiden - Powerslave - Rime of the Ancient Mariner`,
            `Iron Maiden - Iron Maiden - The Phantom of the Opera`
        ]);
        servers.set(`Rap Universe`, [
            `Travis Scott - Rodeo (Expanded Edition) - 90210 `,
            `Kendrick Lamar - Good Kid, m.A.A.d City - m.A.A.d City`,
            `Kanye West - My Beautiful Dark Twisted Fantasy - Monster`
        ]);
        servers.set(`MusicGate`, [
            `Delta Sleep - Twin Galaxies - Lake Sprinkle Sprankle`,
            `The Brobecks - Violent Things - Goodnight Socialite`,
            `Pig Destroyer - Prowler in the Yard - Cheerleader Corpses`
        ]);
        const embed = new FMcordEmbed(message)
            .setTitle(`Lists of songs from the servers that participated in the event.`)
            .setDescription(`Note: Field names are server names. Format goes like this: Artist - Album - Song`)
            .setFooter(`Thanks to everyone who participated!`);
        [...servers.entries()].forEach(([server, song]) => {
            embed.addField(server, song.join(`\n`));
        });
        await message.channel.createMessage({ embed });
    }

}