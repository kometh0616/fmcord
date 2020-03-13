import { Message } from "eris";
import FMcord from "../handler/FMcord";

export default (message: Message): string[] => [(message.channel.client as FMcord).ownerID];