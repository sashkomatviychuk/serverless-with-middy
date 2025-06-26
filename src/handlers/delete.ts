import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import get from 'lodash.get';

import { client } from '../utils/db';
import { response } from '../utils/response';

type PathParameters = {
  id: string;
};

const TableName = process.env.ITEMS_TABLE!;

const createKeyCondition = (S: string) => ({
  id: { S },
});

const deleteItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // const { id } = event.pathParameters as PathParameters;
  const id = get(event, 'pathParameters.id') as string;

  await client.send(
    new DeleteItemCommand({
      Key: createKeyCondition(id),
      TableName,
    })
  );

  return response(200, {
    message: 'Item deleted',
  });
};

const eventSchema = transpileSchema({
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 1 },
      },
      required: ['id'],
    },
  },
  required: ['pathParameters'],
});

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>({})
  .use(httpErrorHandler())
  .use(validator({ eventSchema }))
  .handler(deleteItem);
