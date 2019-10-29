import UserFetcher from "./UserFetcher";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import { LastFMUserRecentTracks, LastFMUserRecentTrack } from "../lib/lastfm/typings";
import Library from "../lib/lastfm";

export default class TrackFetcher extends UserFetcher {

    private readonly client: FMcord;
    private readonly lib: Library;
    
    public constructor(client: FMcord, message: Message) {
        super(message);
        this.client = client;
        this.lib = new Library(client.apikeys.lastFM);
    }

    public async getRecentTracks(): Promise<LastFMUserRecentTracks | null> {
        const username: string | null = await this.username();
        if (username) {
            const data: LastFMUserRecentTracks = await this.lib.user.getRecentTracks(username);
            return data;
        } else {
            return null;
        }
    }

    public async getCurrentTrack(): Promise<LastFMUserRecentTrack | null> {
        const current: LastFMUserRecentTracks | null = await this.getRecentTracks();
        if (current) {
            const track: LastFMUserRecentTrack = current.track[0];
            if (track[`@attr`]) {
                return track;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public async getLatestTrack(): Promise<LastFMUserRecentTrack | null> {
        const recent: LastFMUserRecentTracks | null = await this.getRecentTracks();
        if (recent) {
            if (recent.track[0][`@attr`]) {
                return recent.track[1];
            } else {
                return recent.track[0];
            }
        } else {
            return null;
        }
    }

}