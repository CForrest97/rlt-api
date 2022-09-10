import middy from "@middy/core";
import validator from "@middy/validator";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import jsonResponder from "../../../utils/jsonResponder";
import { getPlayerResponseUseCase } from "../../../useCases/getPlayerResponse";
import { PlaylistId } from "../../../model/playlist";

const inputSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        playerId: { type: "string", minLength: 1 },
      },
      required: ["playerId"],
    },
  },
};

export type Playlist = {
  id: string;
  mmr: number;
  rank: string;
  mmrRequiredForUpperDivision: number;
  mmrRequiredForLowerDivision: number;
  winStreak: number;
  mmrChangeToday: number;
};

export type PlayerResponse = {
  id: string;
  playlists: Record<PlaylistId, Playlist>;
};

const getPlayer = async (
  event: APIGatewayProxyEvent & { pathParameters: Record<string, string> }
): Promise<PlayerResponse> => {
  Sentry.init({
    dsn: "https://7f301f2bd39f4c1faf92749836366d86@o1102353.ingest.sentry.io/6128578",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  const transaction = Sentry.startTransaction({
    op: "test",
    name: "My First Test Transaction",
  });

  const { playerId } = event.pathParameters;

  try {
    const getOrderResponse = getPlayerResponseUseCase();

    return getOrderResponse(playerId);
  } catch (e) {
    console.log("caught error ", e);
    Sentry.captureException(e);
  }
  transaction.finish();

  return {} as any;
};

export default middy(getPlayer)
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())
  .use(jsonResponder());
