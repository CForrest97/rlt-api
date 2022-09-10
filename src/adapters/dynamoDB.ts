import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import dayjs from "dayjs";

import { PlaylistId } from "../model/playlist";
import { Rating } from "../model/rating";

const client = new DynamoDBClient({ region: "eu-west-2" });

export const getRatings = async (
  playerId: string,
  playlistId: PlaylistId
): Promise<Rating[]> => {
  const queryCommand = new QueryCommand({
    TableName: "rlt-player-playlist-record",
    KeyConditionExpression: "#HashKey = :playerPlaylistId",
    ExpressionAttributeNames: {
      "#HashKey": "player-playlist-id",
    },
    ExpressionAttributeValues: {
      ":playerPlaylistId": { S: `${playerId.toLowerCase()}_${playlistId}` },
    },
    ConsistentRead: true,
  });

  const response = await client.send(queryCommand);

  return response.Items!.map((item) => ({
    playerId,
    playlistId,
    value: parseInt(item.value.N as string, 10),
    timestamp: dayjs(parseInt(item.timestamp.N as string, 10)),
    numberOfGamesPlayed: parseInt(item.numberOfGamesPlayed.N as string, 10),
  }));
};

export const getLatestRating = async (
  playerId: string,
  playlistId: PlaylistId
): Promise<Rating> => {
  const queryCommand = new QueryCommand({
    TableName: "rlt-player-playlist-record",
    KeyConditionExpression: "#HashKey = :playerPlaylistId",
    ExpressionAttributeNames: {
      "#HashKey": "player-playlist-id",
    },
    ExpressionAttributeValues: {
      ":playerPlaylistId": { S: `${playerId.toLowerCase()}_${playlistId}` },
    },
    ConsistentRead: true,
    ScanIndexForward: false,
    Limit: 1,
  });

  const response = await client.send(queryCommand);

  const item = response.Items![0];

  return {
    playerId,
    playlistId,
    value: parseInt(item.value.N as string, 10),
    timestamp: dayjs(parseInt(item.timestamp.N as string, 10)),
    numberOfGamesPlayed: parseInt(item.numberOfGamesPlayed.N as string, 10),
  };
};

export const getFirstRatingsForToday = async (
  playerId: string,
  playlistId: PlaylistId
): Promise<Rating> => {
  console.log(dayjs().startOf("day").add(5, "hours").valueOf().toString());
  const queryCommand = new QueryCommand({
    TableName: "rlt-player-playlist-record",
    KeyConditionExpression:
      "#HashKey = :playerPlaylistId AND #sortKey > :startOfDayTimestamp",
    ExpressionAttributeNames: {
      "#HashKey": "player-playlist-id",
      "#sortKey": "timestamp",
    },
    ExpressionAttributeValues: {
      ":playerPlaylistId": { S: `${playerId.toLowerCase()}_${playlistId}` },
      ":startOfDayTimestamp": {
        N: dayjs()
          .startOf("day")
          .add(5, "hours")
          .subtract(10, "seconds")
          .valueOf()
          .toString(),
      },
    },
    ConsistentRead: true,
    ScanIndexForward: true,
    Limit: 1,
  });

  const response = await client.send(queryCommand);

  const item = response.Items![0];

  return {
    playerId,
    playlistId,
    value: parseInt(item.value.N as string, 10),
    timestamp: dayjs(parseInt(item.timestamp.N as string, 10)),
    numberOfGamesPlayed: parseInt(item.numberOfGamesPlayed.N as string, 10),
  };
};

export const putRating = async (
  playerId: string,
  playlist: PlaylistId,
  value: number,
  numberOfGamesPlayed: number
): Promise<void> => {
  const putCommand = new PutItemCommand({
    TableName: "rlt-player-playlist-record",
    Item: {
      "player-playlist-id": {
        S: `${playerId.toLowerCase()}_${playlist}`,
      },
      timestamp: {
        N: dayjs().valueOf().toString(),
      },
      value: {
        N: value.toString(),
      },
      numberOfGamesPlayed: {
        N: numberOfGamesPlayed.toString(),
      },
    },
  });

  await client.send(putCommand);
};
