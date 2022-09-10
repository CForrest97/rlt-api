import { RatingsResponse } from "../controllers/http/players/getPlayerPlaylistRecord";
import { PlaylistId } from "../model/playlist";
import { getRatings } from "../adapters/dynamoDB";
import { Rating } from "../model/rating";

const buildRatingsResponse = (
  playerId: string,
  playlistId: PlaylistId,
  ratings: Rating[]
): RatingsResponse => ({
  playerId,
  playlistId,
  ratings: ratings.map((rating) => ({
    value: rating.value,
    timestamp: rating.timestamp.valueOf(),
  })),
});

export const getRatingsResponseUseCase =
  () =>
  async (playerId: string, playlist: PlaylistId): Promise<RatingsResponse> => {
    const ratings = await getRatings(playerId, playlist);

    console.log(ratings);
    return buildRatingsResponse(playerId, playlist, ratings);
  };
