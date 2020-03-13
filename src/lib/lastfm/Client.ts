import https from "https";

class LastFMError extends Error {

    public readonly code: number;
    public constructor(code: number, message?: string) {
        super(message);
        this.code = code;
    }

}

export default abstract class LastFMClient {

    public readonly apikey: string;
    public readonly url: string;
    public constructor(apikey: string) {
        this.apikey = apikey;
        this.url = `https://ws.audioscrobbler.com/2.0/?`;
    }

    public request(url: string): Promise<Record<string, unknown>> {
        return new Promise<Record<string, unknown>>((resolve, reject) => {
            https.get(url, res => {
                if (res.statusCode && res.statusCode !== 200) {
                    reject(new LastFMError(res.statusCode, `Request failed. Status code: ${res.statusCode}`));
                }
                let rawData = ``;
                res.on(`data`, chunk => rawData += chunk);
                res.on(`end`, () => {
                    try {
                        const data: Record<string, unknown> = JSON.parse(rawData);
                        if (data.error) {
                            reject(new LastFMError(data.error as number, data.message as string));
                        } else {
                            resolve(data);
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    }

}