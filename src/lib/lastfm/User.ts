import LastFMClient from "./Client";
import { LastFMUser, LastFMUserRecentTracks, LastFMTopOptions, LastFMUserTopAlbums, LastFMUserTopArtists, LastFMUserTopTracks } from "./typings";
import { stringify } from "querystring";

const defaultOptions: LastFMTopOptions = {
    period: `overall`,
    limit: `50`,
    page: `1`
};

export default class User extends LastFMClient {

    public constructor(apikey: string) {
        super(apikey);
    }

    public async getInfo(user: string): Promise<LastFMUser> {
        const params = {
            method: `user.getinfo`,
            user,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`) as Record<string, unknown>;
        return data.user as LastFMUser;
    }

    public async getRecentTracks(user: string, from?: string): Promise<LastFMUserRecentTracks> {
        const params = {
            method: `user.getrecenttracks`,
            user, from,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.recenttracks as LastFMUserRecentTracks;
    }

    public async getTopAlbums(user: string, options: LastFMTopOptions = defaultOptions): Promise<LastFMUserTopAlbums> {
        const params = {
            method: `user.gettopalbums`,
            user, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.topalbums as LastFMUserTopAlbums;
    }

    public async getTopArtists(user: string, options: LastFMTopOptions = defaultOptions): Promise<LastFMUserTopArtists> {
        const params = {
            method: `user.gettopartists`,
            user, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.topartists as LastFMUserTopArtists;
    }

    public async getTopTracks(user: string, options: LastFMTopOptions = defaultOptions): Promise<LastFMUserTopTracks> {
        const params = {
            method: `user.gettoptracks`,
            user, ...options,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.toptracks as LastFMUserTopTracks;
    }
    
}