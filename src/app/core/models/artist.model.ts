export interface ArtistSummary {
  id: string;
  name: string;
  count: number;
}

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  popularity: number;
  explicit: boolean;
  spotify_id: string;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  spotify_id: string;
  tracks_count: number;
  created_at: string;
  updated_at: string;
}