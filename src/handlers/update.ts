import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { client } from '../utils/db';
import { response } from '../utils/response';

const TableName = process.env.ITEMS_TABLE!;
const ReturnValues = 'ALL_NEW';

const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id as string;
  const data = event.body as any;

  await client.send(
    new UpdateItemCommand({
      TableName,
      ReturnValues,
      Key: { id: { S: id } },
      UpdateExpression: 'set #name = :name',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: { ':name': data.name },
    })
  );

  return response(200, { message: 'Item updated' });
};

const eventSchema = transpileSchema({
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
      },
      required: ['name'],
    },
  },
  required: ['body', 'pathParameters'],
});

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(validator({ eventSchema }))
  .handler(update);
