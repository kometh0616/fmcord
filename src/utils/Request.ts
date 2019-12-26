import { LastFMRequestParams } from "../lib/lastfm/typings";
import { stringify, ParsedUrlQueryInput } from "querystring";
import https from "https";

const url = `https://ws.audioscrobbler.com/2.0/?`;

export default (params: LastFMRequestParams): Promise<unknown> => {
    const query: string = stringify(params as ParsedUrlQueryInput);
    return new Promise<unknown>((resolve, reject) => {
        https.get(`${url}${query}`, res => {
            if (res.statusCode !== 200) {
                reject(new Error(`Request failed. Status code: ${res.statusCode}`));
            }
            let rawData = ``;
            res.on(`data`, chunk => rawData += chunk);
            res.on(`end`, () => {
                try {
                    const data: Record<string, unknown> = JSON.parse(rawData);
                    if (data.error) {
                        reject(new Error(data.message as string));
                    }
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }).on(`error`, reject);
    });
};