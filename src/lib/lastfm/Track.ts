import LastFMClient from "./Client";
import { LastFMTrackInfoOptions, LastFMTrackInfo, LastFMRequestParams } from "./typings";
import { stringify, ParsedUrlQueryInput } from "querystring";

export default class Track extends LastFMClient {

    public constructor(apikey: string) {
        super(apikey);
    }

    public async getInfo(artist: string, track: string, options?: LastFMTrackInfoOptions): Promise<LastFMTrackInfo> {
        const params: LastFMRequestParams = {
            method: `track.getinfo`,
            artist, track, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params as ParsedUrlQueryInput);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.track as LastFMTrackInfo;
    }

}