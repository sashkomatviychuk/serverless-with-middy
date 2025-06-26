import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from 'aws-lambda';

import { client } from '../utils/db';
import { response } from '../utils/response';

const read = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log({ event });

  try {
    const result = await client.send(new QueryCommand({ TableName: process.env.ITEMS_TABLE }));

    return response(200, result.Items ?? []);
  } catch {
    return response(400, {
      error: 'Error occured during querying DB',
    });
  }
};

const eventSchema = {
  type: 'object',
  properties: {},
  required: [],
};

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(validator({ eventSchema: transpileSchema(eventSchema) }))
  .use(httpErrorHandler())
  .handler(read);
