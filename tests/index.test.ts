import { getPlayer } from "../src/adapters/rocketLeagueTrackerNetwork";

test("should pass", async () => {
  const p = await getPlayer("CForrest97");
  expect(p).toEqual("");
});
