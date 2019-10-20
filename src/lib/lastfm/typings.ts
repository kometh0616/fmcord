export interface LastFMRequestParams extends Record<string, string> {
    method: string;
    api_key: string;
    format: `json`;
}

export interface LastFMTopOptions {
    period: `overall` | `7day` | `1month` | `3month` | `6month` | `12month`;
    limit: string;
    page: string;
}

export interface LastFMImage {
    size: `small` | `medium` | `large` | `extralarge` | `mega`;
    [`#text`]: string;
}

export interface LastFMRegisterData {
    unixtime: string;
    [`#text`]: number;
}

export interface LastFMUser {
    playlists: string;
    playcount: string;
    gender: `n` | `f` | `m`;
    name: string;
    subscriber: string;
    url: string;
    country: string;
    image: LastFMImage[];
    registered: LastFMRegisterData;
    type: string;
    age: string;
    bootstrap: string;
    realname: string;
}

interface LastFMPagingAttributes {
    page: string;
    perPage: string;
    user: string;
    total: string;
    totalPages: string;
}

interface LastFMUnitData {
    mbid: string;
    [`#text`]: string;
}

interface LastFMUserRecentTrackDate {
    uts: string;
    [`#text`]: string;
}

interface LastFMUserRecentTrack {
    artist: LastFMUnitData;
    album: LastFMUnitData;
    image: LastFMImage[];
    streamable: string;
    date: LastFMUserRecentTrackDate;
    url: string;
    mbid: string;
}

export interface LastFMUserRecentTracks {
    [`@attr`]: LastFMPagingAttributes;
    track: LastFMUserRecentTrack[];
}

interface LastFMTopRankArtist {
    url: string;
    name: string;
    mbid: string;
}

interface LastFMRankAttribute {
    rank: string;
}

interface LastFMUserTopAlbum {
    artist: LastFMTopRankArtist;
    [`@attr`]: LastFMRankAttribute;
    image: LastFMImage[];
    url: string;
    name: string;
    mbid: string;
}

export interface LastFMUserTopAlbums {
    [`@attr`]: LastFMPagingAttributes;
    album: LastFMUserTopAlbum[];
}

interface LastFMUserTopArtist {
    [`@attr`]: LastFMRankAttribute;
    mbid: string;
    url: string;
    playcount: string;
    image: LastFMImage[];
    name: string;
    streamable: string;
}

export interface LastFMUserTopArtists {
    [`@attr`]: LastFMPagingAttributes;
    artist: LastFMUserTopArtist[];
}

interface LastFMTopTrackStreamable {
    fulltrack: string;
    [`#text`]: string;
}

interface LastFMTopTrack {
    [`@attr`]: LastFMRankAttribute;
    duration: string;
    playcount: string;
    artist: LastFMTopRankArtist;
    image: LastFMImage[];
    streamable: LastFMTopTrackStreamable;
    mbid: string;
    name: string;
    url: string;
}

export interface LastFMUserTopTracks {
    [`@attr`]: LastFMPagingAttributes;
    track: LastFMTopTrack[];
}