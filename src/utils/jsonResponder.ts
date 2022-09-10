import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const jsonResponder = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const after: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    if (request.response === undefined) return;

    request.response = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(request.response),
      statusCode: 200,
    };
  };

  return {
    after,
  };
};

export default jsonResponder as any;
