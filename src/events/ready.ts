import FMcord from "../handler/FMcord";

export default (client: FMcord): void => {
    console.log(`I am ready.`);
    setTimeout(() => client.editStatus(`online`, {
        type: 0,
        name: `with ${client.guilds.size} servers | Do ${client.prefix}help!`
    }), 5000);
};