import { ConfigService } from '@nestjs/config';
import { ClientConfig, Pool } from 'pg';

export const INSTANCY_DB_CONNECTION = 'INSTANCY_DB_CONNECTION';

async function createDbConnection(configProvider: ConfigService) {
  const config: ClientConfig = {
    user: configProvider.get('INSTANCY_DB_USERNAME'),
    database: configProvider.get('INSTANCY_DB_NAME'),
    port: +configProvider.get('INSTANCY_DB_PORT'),
    host: configProvider.get('INSTANCY_DB_HOST') || '',
    password: configProvider.get('INSTANCY_DB_PASSWORD'),
    ssl: true,
  };
  const searchPath = configProvider.get('INSTANCY_SEARCH_PATH');
  const client = new Pool(config);
  const poolClient = await client.connect();
  await poolClient.query(`set search_path='${searchPath}'`);

  return poolClient;
}

export const instancyDbConnectionFactory = {
  provide: INSTANCY_DB_CONNECTION,
  useFactory: createDbConnection,
  inject: [ConfigService],
};
