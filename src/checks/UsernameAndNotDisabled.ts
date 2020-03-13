import UsernameCheck from "./UsernameCheck";
import NotDisabled from "./NotDisabled";
import { Message } from "eris";

export default async (message: Message): Promise<boolean> => await UsernameCheck(message) && await NotDisabled(message);