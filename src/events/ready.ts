import FMcord from "../handler/FMcord";

export default (client: FMcord): void => {
    console.log(`I am ready.`);
    setTimeout(() => client.editStatus(`online`, {
        type: 0,
        name: `#ProjectBlurple | Do ${client.prefix}help!`
    }), 60000);
};