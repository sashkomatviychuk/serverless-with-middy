import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { response } from '../utils/response';

const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const data = event.body as any;

  const item = {
    id: Date.now().toString(),
    ...data,
  };

  return response(201, { message: 'Item created', item });
};

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .handler(create);
