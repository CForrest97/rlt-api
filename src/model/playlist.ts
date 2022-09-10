export type PlaylistId =
  | "duels"
  | "doubles"
  | "standard"
  | "hoops"
  | "rumble"
  | "dropshot"
  | "tournaments"
  | "snowday";

export type Playlist = {
  id: PlaylistId;
  value: number;
  numberOfGamesPlayed: number;
  rank: string;
  mmrRequiredForUpperDivision: number;
  mmrRequiredForLowerDivision: number;
  winStreak: number;
};
