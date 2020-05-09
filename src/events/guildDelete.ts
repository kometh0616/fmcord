import FMcord from "../handler/FMcord";

export default (client: FMcord): void => {
    client.editStatus(`online`, {
        type: 0,
        name: `#ProjectBlurple | Do ${client.prefix}help!`
    });
};