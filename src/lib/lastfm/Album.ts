import LastFMClient from "./Client";
import { LastFMAlbumInfoOptions, LastFMAlbumInfo } from "./typings";
import { stringify, ParsedUrlQueryInput } from "querystring";

export default class Album extends LastFMClient {

    public constructor(apikey: string) {
        super(apikey);
    }

    public async getInfo(artist: string, album: string, options?: LastFMAlbumInfoOptions): Promise<LastFMAlbumInfo> {
        const params: ParsedUrlQueryInput = {
            method: `album.getinfo`,
            artist, album, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data = await this.request(`${this.url}${query}`);
        return data.album as LastFMAlbumInfo;
    }

}