import { stringify } from "querystring";
import https from "https";

const url = `https://www.googleapis.com/youtube/v3/search?`;

interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
}

interface ThumbnailProperties {
    url: string;
    width: number;
    height: number;
}

interface SearchResultThumbnails {
    default: ThumbnailProperties;
    medium: ThumbnailProperties;
    high: ThumbnailProperties;
}

interface SearchResultID {
    kind: string;
    videoId: string;
    channelId: string;
    playlistId: string;
}

interface SearchResultSnippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: SearchResultThumbnails;
    channelTitle: string;
    liveBroadcastContent: `upcoming` | `live` | `none`;
}

interface SearchResult {
    kind: `youtube#searchListResponse`;
    etag: string;
    nextPageToken: string;
    prevPageToken: string;
    pageInfo: PageInfo;
    items: SearchResultSnippet[];
}

export default class YouTubeRequest {

    private readonly apikey: string;

    public constructor(apikey: string) {
        this.apikey = apikey;
    }

    public search(query: string): Promise<SearchResult> {
        const params = stringify({
            key: this.apikey,
            q: query,
            part: `snippet`,
            type: `video`
        });
        return new Promise<SearchResult>((resolve, reject) => {
            https.get(`${url}${params}`, res => {
                const contentType = res.headers[`content-type`] as string;
                if (res.statusCode !== 200) {
                    reject(new Error(`Request failed. Status code: ${res.statusCode}`));
                } else if (!contentType.includes(`application/json`)) {
                    reject(new Error(`Expected application/json but got ${contentType}`));
                }
                let rawData = ``;
                res.on(`data`, chunk => rawData += chunk);
                res.on(`end`, () => {
                    try {
                        const data: SearchResult = JSON.parse(rawData);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on(`error`, reject);
        });
    }

}