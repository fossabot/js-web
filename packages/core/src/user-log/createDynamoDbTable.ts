import { CreateTableCommand, CreateTableInput } from '@aws-sdk/client-dynamodb';

import client from '../dynamoDBConnection';
import { UserActivityLogsTableName } from './constants';

const userActivityLogTableParams: CreateTableInput = {
  TableName: UserActivityLogsTableName,
  KeySchema: [
    {
      AttributeName: 'UserId',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'LogStartAt',
      KeyType: 'RANGE',
    },
  ],
  AttributeDefinitions: [
    { AttributeName: 'UserId', AttributeType: 'S' },
    { AttributeName: 'LogStartAt', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
};

const command = new CreateTableCommand(userActivityLogTableParams);
client
  .send(command)
  .then((res) => {
    // eslint-disable-next-line no-console
    console.log(res);
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.log('error', e);
  });
