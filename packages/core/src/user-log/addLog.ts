import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';

import client from '../dynamoDBConnection';
import { UserActivityLogsTableName } from './constants';

export interface IUserActivityLogsParams {
  email?: string;
  userId: string;
  method: string;
  message?: string;
  category: string;
  endpoint: string;
  subCategory?: string;
  userFullName?: string;
  requestBody?: unknown;
  logStartAt: string;
  status: 'PENDING' | 'SUCCESS';
}

export default function addLog(params: IUserActivityLogsParams) {
  if (process.env.UserActivityLogsTableName === '') {
    return;
  }

  const logParams: PutCommandInput = {
    TableName: UserActivityLogsTableName,
    Item: {
      Email: params.email,
      UserId: params.userId,
      Method: params.method,
      Status: params.status,
      Message: params.message,
      Category: params.category,
      Endpoint: params.endpoint,
      SubCategory: params.subCategory,
      RequestBody: params.requestBody,
      LogStartAt: params.logStartAt,
      LogEndAt: new Date().toISOString(),
      UserFullName: params.userFullName,
    },
  };

  const command = new PutCommand(logParams);
  // eslint-disable-next-line consistent-return
  return client.send(command);
}
