import LastFMClient from "./Client";
import { LastFMTagInfo } from "./typings";
import { stringify, ParsedUrlQueryInput } from "querystring";

export default class Tag extends LastFMClient {

    public constructor(apikey: string) {
        super(apikey);
    }

    public async getInfo(tag: string): Promise<LastFMTagInfo> {
        const params: ParsedUrlQueryInput = {
            method: `tag.getinfo`,
            tag,
            // eslint-disable-next-line @typescript-eslint/camelcase
            api_key: this.apikey,
            format: `json`
        };
        const query = stringify(params);
        const data: Record<string, unknown> = await this.request(`${this.url}${query}`);
        return data.tag as LastFMTagInfo;
    }

}