import axios from "axios";
import { Player } from "../model/player";
import { Playlist, PlaylistId } from "../model/playlist";
import ranks from "../fixtures/doublesRanks.json";
import puppeteer from "puppeteer";

import chromium from "chrome-aws-lambda";

const buildUrl = (id: string) =>
  `https://api.tracker.gg/api/v2/rocket-league/standard/profile/psn/${id}?c=${new Date().valueOf()}`;

const mapToPlaylistId = (id: string): PlaylistId | null => {
  switch (id) {
    case "Ranked Duel 1v1":
      return "duels";
    case "Ranked Doubles 2v2":
      return "doubles";
    case "Ranked Standard 3v3":
      return "standard";
    case "Hoops":
      return "hoops";
    case "Rumble":
      return "rumble";
    case "Dropshot":
      return "dropshot";
    case "Snowday":
      return "snowday";
    case "Tournament Matches":
      return "tournaments";
    default:
      console.log(`Playlist with ID: "${id}" not recognised`);
      return null;
  }
};

export const foo = async (username: string) => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
  );

  return new Promise((res) => {
    page.on("response", async (response) => {
      console.log("XHR response received");

      // browser.close();
      res(response.json());
    });

    page
      .goto(
        `https://api.tracker.gg/api/v2/rocket-league/standard/profile/psn/${username}/segments/playlist?season=21`
      )
      .then(() => page.content());
  });
};

export const getPlayer = async (id: string): Promise<Player> => {
  // const url = buildUrl(id);

  const response: any = await foo(id);

  // const { data } = response.data;

  // const lastUpdate = data.metadata.lastUpdated.value;
  //
  // const lastUpdated: number = dayjs(lastUpdate).valueOf();

  const playlistSegments = response.data;

  const playlists: Playlist[] = (playlistSegments as any[]).flatMap(
    (playlist) => {
      const numberOfGamesPlayed = playlist.stats.matchesPlayed.value;
      const playlistName = mapToPlaylistId(playlist.metadata.name);

      if (playlistName === null) {
        return [];
      }

      let deltaDown: number;
      let deltaUp: number;

      if (playlist.metadata.name === "Ranked Doubles 2v2") {
        const tier: string = playlist.stats.tier?.metadata.name!;
        const division: number = playlist.stats.division?.value!;
        const { min, max } = ranks.find((rank) => rank.tier === tier)
          ?.divisions[division] as any;

        console.log(playlist.stats.rating.value, min, max);

        deltaDown = Math.max(playlist.stats.rating.value - min + 1, 1);
        deltaUp = Math.max(max - playlist.stats.rating.value + 1, 1);
      } else {
        deltaDown = playlist.stats.division.metadata.deltaDown ?? 1;
        deltaUp = playlist.stats.division.metadata.deltaUp ?? 1;
      }

      return [
        {
          id: playlistName,
          numberOfGamesPlayed,
          value: playlist.stats.rating.value,
          winStreak: parseInt(playlist.stats.winStreak.displayValue, 10),
          mmrRequiredForUpperDivision: deltaUp,
          mmrRequiredForLowerDivision: deltaDown,
          rank: `${playlist.stats.tier?.metadata.name} - ${playlist.stats.division?.metadata.name}`,
        },
      ];
    }
  );

  return {
    id,
    playlists: playlists.reduce(
      (acc, playlist): Partial<Player["playlists"]> => ({
        ...acc,
        [playlist.id]: playlist,
      }),
      {}
    ) as Player["playlists"],
  };
};
