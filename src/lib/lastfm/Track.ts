import LastFMClient from "./Client";
import { LastFMTrackInfoOptions, LastFMTrackInfo } from "./typings";
import { stringify, ParsedUrlQueryInput } from "querystring";

export default class Track extends LastFMClient {

    public constructor(apikey: string) {
        super(apikey);
    }

    public async getInfo(artist: string, track: string, options?: LastFMTrackInfoOptions): Promise<LastFMTrackInfo> {
        const params: ParsedUrlQueryInput = {
            method: `track.getinfo`,
            artist, track, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.track as LastFMTrackInfo;
    }

}