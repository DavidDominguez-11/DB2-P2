from enum import Enum


class NodeLabel(str, Enum):
    USER = "User"
    SONG = "Song"
    ARTIST = "Artist"
    POST = "Post"
    PLAYLIST = "Playlist"
    GENRE = "Genre"
    FEATURED = "Featured"
    AD = "Ad"


# Maps each primary label to its unique identifier property
ID_FIELD_MAP: dict[str, str] = {
    NodeLabel.USER: "user_id",
    NodeLabel.SONG: "song_id",
    NodeLabel.ARTIST: "artist_id",
    NodeLabel.POST: "post_id",
    NodeLabel.PLAYLIST: "playlist_id",
    NodeLabel.GENRE: "genre_id",
}

VALID_LABELS: set[str] = {label.value for label in NodeLabel}

# Labels that own a unique ID (excluding secondary/decorator labels)
PRIMARY_LABELS: set[str] = set(ID_FIELD_MAP.keys())
