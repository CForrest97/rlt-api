import { Dayjs } from "dayjs";
import { PlaylistId } from "./playlist";

export type Rating = {
  playerId: string;
  playlistId: PlaylistId;
  value: number;
  timestamp: Dayjs;
  numberOfGamesPlayed: number;
};
