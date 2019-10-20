export interface LastFMRequestParams extends Record<string, string | undefined> {
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
    size: `small` | `medium` | `large` | `extralarge` | `mega` | ``;
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
    mbid?: string;
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
    mbid?: string;
}

export interface LastFMUserRecentTracks {
    [`@attr`]: LastFMPagingAttributes;
    track: LastFMUserRecentTrack[];
}

interface LastFMBasicArtistInfo {
    url: string;
    name: string;
    mbid?: string;
}

interface LastFMRankAttribute {
    rank: string;
}

interface LastFMUserTopAlbum {
    artist: LastFMBasicArtistInfo;
    [`@attr`]: LastFMRankAttribute;
    image: LastFMImage[];
    url: string;
    name: string;
    mbid?: string;
}

export interface LastFMUserTopAlbums {
    [`@attr`]: LastFMPagingAttributes;
    album: LastFMUserTopAlbum[];
}

interface LastFMUserTopArtist {
    [`@attr`]: LastFMRankAttribute;
    mbid?: string;
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

interface LastFMTrackStreamable {
    fulltrack: string;
    [`#text`]: string;
}

interface LastFMTopTrack {
    [`@attr`]: LastFMRankAttribute;
    duration: string;
    playcount: string;
    artist: LastFMBasicArtistInfo;
    image: LastFMImage[];
    streamable: LastFMTrackStreamable;
    mbid?: string;
    name: string;
    url: string;
}

export interface LastFMUserTopTracks {
    [`@attr`]: LastFMPagingAttributes;
    track: LastFMTopTrack[];
}

interface LastFMArtistStats {
    listeners: string;
    playcount: string;
}

interface LastFMSimilarArtist {
    name: string;
    url: string;
    image: LastFMImage[];
}

interface LastFMTag {
    name: string;
    url: string;
}

interface LastFMBiographyLink {
    link: {
        [`#text`]: string;
        rel: string;
        href: string;
    };
}

interface LastFMBiography {
    links: LastFMBiographyLink;
    published: string;
    summary: string;
    content: string;
}

export interface LastFMArtistInfoOptions {
    mbid?: string;
    lang?: string;
    autocorrect?: `0` | `1`;
    username?: string; 
}

export interface LastFMArtistInfo {
    name: string;
    mbid?: string;
    url: string;
    image: LastFMImage[];
    streamable: string;
    ontour: string;
    stats: LastFMArtistStats;
    similar: {
        artist: LastFMSimilarArtist[];
    };
    tags: {
        tag: LastFMTag[];
    };
    bio: LastFMBiography;
}

interface LastFMPositionAttribute {
    position: string;
}

interface LastFMTrackAlbum {
    artist: string;
    name: string;
    mbid?: string;
    url: string;
    image: LastFMImage[];
    [`@attr`]: LastFMPositionAttribute;
}

export interface LastFMTrackInfoOptions {
    mbid?: string;
    username?: string;
    autocorrect?: `0` | `1`;
}

export interface LastFMTrackInfo {
    name: string;
    mbid?: string;
    url: string;
    duration: string;
    streamable: LastFMTrackStreamable;
    artist: LastFMBasicArtistInfo;
    album?: LastFMTrackAlbum;
    toptags: {
        tag: LastFMTag[];
    };
    wiki?: {
        published: string;
        summary: string;
        content: string;
    };
}