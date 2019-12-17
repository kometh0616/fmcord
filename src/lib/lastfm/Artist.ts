// @ts-nocheck

import LastFMClient from "./Client";
import { LastFMArtistInfo, LastFMArtistInfoOptions, LastFMRequestParams } from "./typings";
import { stringify } from "querystring";

export default class Artist extends LastFMClient {

    public constructor(apikey: string) {
        super(apikey);
    }

    public async getInfo(artist: string, options?: LastFMArtistInfoOptions): Promise<LastFMArtistInfo> {
        const params: LastFMRequestParams = {
            method: `artist.getinfo`,
            artist, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.artist as LastFMArtistInfo;
    }
    
}