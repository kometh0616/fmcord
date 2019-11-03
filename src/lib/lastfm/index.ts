import Artist from "./Artist";
import Track from "./Track";
import User from "./User";
import Tag from "./Tag";
import Album from "./Album";

export default class Library {
    
    public readonly artist: Artist;
    public readonly album: Album;
    public readonly track: Track;
    public readonly user: User;
    public readonly tag: Tag;

    public constructor(apikey: string) {
        this.artist = new Artist(apikey);
        this.album = new Album(apikey);
        this.track = new Track(apikey);
        this.user = new User(apikey);
        this.tag = new Tag(apikey);
    }

}