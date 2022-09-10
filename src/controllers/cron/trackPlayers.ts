import { getPlayer } from "../../adapters/rocketLeagueTrackerNetwork";
import { putRating } from "../../adapters/dynamoDB";

const playerIds = ["cforrest97", "ajrbond007", "rwalle61"];

const trackPlayers = async () => {
  const players = await Promise.all(playerIds.map((id) => getPlayer(id)));

  await Promise.all(
    players.flatMap((player) =>
      Object.values(player.playlists).map((playlist) =>
        putRating(
          player.id,
          playlist.id,
          playlist.value,
          playlist.numberOfGamesPlayed
        )
      )
    )
  );
};

export default trackPlayers;
