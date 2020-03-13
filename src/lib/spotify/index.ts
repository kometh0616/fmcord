import querystring from "querystring";
import https, { RequestOptions } from "https";
import { IncomingMessage } from "http";

interface SpotifyClientCredentials {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface SpotifyTrackLink {
    external_urls: Record<string, string>;
    href: string;
    id: string;
    type: `track`;
    uri: string;
}

interface SpotifyRestriction {
    reason: string;
}

interface SpotifyImageObject {
    height: number;
    url: string;
    width: number;
}

interface SpotifySimplifiedAlbum {
    album_group?: `album` | `single` | `compilation` | `appears_on`;
    album_type: `album` | `single` | `compilation`;
    available_markets: string[];
    external_urls: Record<string, string>;
    href: string;
    id: string;
    images: SpotifyImageObject[];
    name: string;
    release_date: string;
    release_date_precision: `day` | `month` | `year`;
    restrictions: SpotifyRestriction;
    type: `album`;
    uri: string;
} 

interface SpotifySimplifiedArtist {
    external_urls: Record<string, string>;
    href: string;
    id: string;
    name: string;
    type: `artist`;
    uri: string;
}

interface SpotifyTrackItem {
    album: SpotifySimplifiedAlbum;
    artists: SpotifySimplifiedArtist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: Record<string, string>;
    external_urls: Record<string, string>;
    href: string;
    id: string;
    is_playable: boolean;
    linked_from: SpotifyTrackLink;
    name: string;
    popularity: number;
    preview_url: string;
    type: `track`;
    uri: string;
    is_local: boolean;
}

interface SpotifyTrack {
    tracks: {
        href: string;
        items: SpotifyTrackItem[];
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total: number;
    };
}

export default class Spotify {

    private readonly id: string;
    private readonly secret: string;

    public constructor(id: string, secret: string) {
        this.id = id;
        this.secret = secret;
    }

    private getToken(): Promise<SpotifyClientCredentials> {
        const query: string = querystring.stringify({
            // eslint-disable-next-line @typescript-eslint/camelcase
            grant_type: `client_credentials`,
        });
        const reqOpts: RequestOptions = {
            hostname: `accounts.spotify.com`,
            path: `/api/token`,
            headers: {
                Authorization: `Basic ${Buffer.from(`${this.id}:${this.secret}`).toString(`base64`)}`,
                'Content-Type': `application/x-www-form-urlencoded`
            },
            method: `POST`
        };
        return new Promise<SpotifyClientCredentials>((resolve, reject) => {
            const req = https.request(reqOpts, (res: IncomingMessage) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Request failed. Status code: ${res.statusCode}`));
                }
                let rawData = ``;
                res.on(`data`, chunk => rawData += chunk);
                res.on(`end`, () => {
                    try {
                        const data: SpotifyClientCredentials = JSON.parse(rawData);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on(`error`, reject);
            req.write(query, error => {
                if (error) {
                    reject(`Error when writing a query: ${error.message}`);
                }
            });
            req.end();
        });
    }

    private async request(url: string): Promise<unknown> {
        const token: SpotifyClientCredentials = await this.getToken();
        const reqOpts: RequestOptions = {
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        };
        return new Promise<unknown>((resolve, reject) => {
            https.get(url, reqOpts, (res: IncomingMessage) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Request failed. Status code: ${res.statusCode}`));
                }
                let rawData = ``;
                res.on(`data`, chunk => rawData += chunk);
                res.on(`end`, () => {
                    try {
                        const data = JSON.parse(rawData);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on(`error`, reject);
        });
    }

    public async findTrack(q: string): Promise<SpotifyTrack> {
        const query: string = querystring.stringify({
            q, type: `track`
        });
        const url = `https://api.spotify.com/v1/search?${query}`;
        const data: SpotifyTrack = await this.request(url) as SpotifyTrack;
        return data;
    }

}
