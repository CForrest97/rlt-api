import middy from "@middy/core";
import validator from "@middy/validator";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayProxyEvent } from "aws-lambda";
import jsonResponder from "../../../utils/jsonResponder";
import { getRatingsResponseUseCase } from "../../../useCases/getRatingsResponse";

const inputSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        playerId: { type: "string", minLength: 1 },
        playlistId: { type: "string", minLength: 1 },
      },
      required: ["playerId", "playlistId"],
    },
  },
};

export type Rating = {
  timestamp: number;
  value: number;
};

export type RatingsResponse = {
  playerId: string;
  playlistId: string;
  ratings: Rating[];
};

const getPlayerPlaylistRecord = async (
  event: APIGatewayProxyEvent & { pathParameters: Record<string, string> }
): Promise<RatingsResponse> => {
  const { playerId, playlistId } = event.pathParameters;

  const getRatingsResponse = getRatingsResponseUseCase();

  return getRatingsResponse(playerId, playlistId as any);
};

export default middy(getPlayerPlaylistRecord)
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(jsonResponder());
