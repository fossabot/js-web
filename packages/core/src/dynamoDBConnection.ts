import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, TranslateConfig } from '@aws-sdk/lib-dynamodb';

const dynamoDBClientConfig: DynamoDBClientConfig = process.env
  .DYNAMODB_MAIN_TABLE_ENDPOINT
  ? {
      endpoint: process.env.DYNAMODB_MAIN_TABLE_ENDPOINT,
      region: process.env.AWS_REGION || 'ap-southeast-1',
    }
  : {};

const dynamoClient = new DynamoDBClient(dynamoDBClientConfig);

const translateConfig: TranslateConfig = {
  marshallOptions: {
    removeUndefinedValues: true,
  },
};

const docClient = DynamoDBDocument.from(dynamoClient, translateConfig);

export default docClient;
