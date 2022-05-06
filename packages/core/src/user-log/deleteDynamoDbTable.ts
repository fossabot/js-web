import {
  DeleteTableCommand,
  DeleteTableCommandInput,
} from '@aws-sdk/client-dynamodb';

import client from '../dynamoDBConnection';
import { UserActivityLogsTableName } from './constants';

const userActivityLogTableParams: DeleteTableCommandInput = {
  TableName: UserActivityLogsTableName,
};

const command = new DeleteTableCommand(userActivityLogTableParams);
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
