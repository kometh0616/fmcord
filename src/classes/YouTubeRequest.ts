const url = `https://www.googleapis.com/youtube/v3/search?`;

export default class YouTubeRequest {

    private readonly apikey: string;

    public constructor(apikey: string) {
        this.apikey = apikey;
    }

}