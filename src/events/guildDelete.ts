import FMcord from "../handler/FMcord";

export default (client: FMcord): void => {
    client.editStatus(`online`, {
        type: 0,
        name: `with ${client.guilds.size} servers | Do ${client.prefix}help!`
    });
};