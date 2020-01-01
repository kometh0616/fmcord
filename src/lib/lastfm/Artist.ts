import LastFMClient from "./Client";
import { LastFMArtistInfo, LastFMArtistInfoOptions, LastFMRequestParams, LastFMArtistTopAlbumsOptions, LastFMArtistTopAlbums } from "./typings";
import { stringify, ParsedUrlQueryInput } from "querystring";

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
        const query = stringify(params as ParsedUrlQueryInput);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.artist as LastFMArtistInfo;
    }
    
    public async getTopAlbums(artist: string, options?: LastFMArtistTopAlbumsOptions): Promise<LastFMArtistTopAlbums> {
        const params: LastFMRequestParams = {
            method: `artist.gettopalbums`,
            artist, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params as ParsedUrlQueryInput);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.topalbums as LastFMArtistTopAlbums;
    }

}