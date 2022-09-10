import { Playlist, PlaylistId } from "./playlist";

export type Player = {
  id: string;
  playlists: Record<PlaylistId, Playlist>;
};
