import { Message } from "eris";
import UserFetcher from "../classes/UserFetcher";

export default async (message: Message): Promise<boolean> => {
    const userFetcher = new UserFetcher(message);
    const username = await userFetcher.username();
    return username !== null;
};