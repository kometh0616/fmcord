import Artist from "./Artist";
import Track from "./Track";
import User from "./User";

class Library {
    public readonly artist: Artist;
    public readonly track: Track;
    public readonly user: User;

    public constructor(apikey: string) {
        this.artist = new Artist(apikey);
        this.track = new Track(apikey);
        this.user = new User(apikey);
    }
}