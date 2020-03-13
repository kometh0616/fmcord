import FMcordEmbed from "./FMcordEmbed";
import { Message, Command } from "eris";

export default class CommandEmbed extends FMcordEmbed {

    public constructor(message: Message, command: Command) {
        super(message);
        this.setTitle(`Command ${command.label}`)
            .addField(`Description`, command.description)
            .addField(`Usage`, command.usage);
        if (command.fullDescription !== `No full description`) {
            this.addField(`Notes`, command.fullDescription);
        }
        if (command.aliases.length > 0) {
            this.addField(`Aliases`, command.aliases.join(`, `));
        }
    }

}