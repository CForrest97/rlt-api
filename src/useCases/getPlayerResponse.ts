import {
  PlayerResponse,
  Playlist,
} from "../controllers/http/players/getPlayer";
import { getPlayer } from "../adapters/rocketLeagueTrackerNetwork";
import { Player } from "../model/player";
import {
  getFirstRatingsForToday,
  getLatestRating,
  putRating,
} from "../adapters/dynamoDB";
import { Rating } from "../model/rating";

const buildPlayerResponse = (
  player: Player,
  firstRatingsToday: Rating[]
): PlayerResponse => {
  const playlists = Object.values(player.playlists).reduce(
    (acc: Partial<PlayerResponse["playlists"]>, playlist) => {
      const p: Playlist = {
        id: playlist.id,
        mmr: playlist.value,
        mmrRequiredForUpperDivision: playlist.mmrRequiredForUpperDivision,
        mmrRequiredForLowerDivision: playlist.mmrRequiredForLowerDivision,
        rank: playlist.rank,
        winStreak: playlist.winStreak,
        mmrChangeToday:
          playlist.value -
          (firstRatingsToday.find((rating) => rating.playlistId === playlist.id)
            ?.value ?? playlist.value),
      };

      return {
        ...acc,
        [p.id]: p,
      };
    },
    {}
  ) as PlayerResponse["playlists"];

  return {
    id: player.id,
    playlists,
  };
};

export const getPlayerResponseUseCase =
  () =>
  async (id: string): Promise<PlayerResponse> => {
    const player = await getPlayer(id);

    const playlists = Object.values(player.playlists);
    const latestRatings = await Promise.all(
      playlists.map((playlist) => getLatestRating(id, playlist.id))
    );

    const firstRatingsToday = await Promise.all(
      playlists.map((playlist) => getFirstRatingsForToday(id, playlist.id))
    );

    await Promise.all(
      Object.values(player.playlists)
        .filter((playlist) => {
          const rating = latestRatings.find(
            (r) => r.playlistId === playlist.id
          );

          return (
            playlist.numberOfGamesPlayed > (rating?.numberOfGamesPlayed ?? 0)
          );
        })
        .map((playlist) =>
          putRating(
            id,
            playlist.id,
            playlist.value,
            playlist.numberOfGamesPlayed
          )
        )
    );

    return buildPlayerResponse(player, firstRatingsToday);
  };
