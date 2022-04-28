import { join } from 'path';

require('dotenv').config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loggingLevel = (): any => {
  if (process.env.DB_LOG_LEVEL) {
    return process.env.DB_LOG_LEVEL;
  }

  switch (process.env.NODE_ENV) {
    case 'production':
      return ['error'];
    case 'test':
      return ['error'];
    default:
      return 'all';
  }
};

export const poolSize = (): number | undefined => {
  switch (process.env.NODE_ENV) {
    case 'test':
      return 1;
    case 'development':
      return 2;
    default:
      return 10;
  }
};

export const getDBName = () => {
  const name = process.env.DB_NAME || '';
  const nameTest = process.env.DB_NAME_TEST || '';
  return process.env.NODE_ENV === 'test' ? nameTest : name;
};

export const connectionConfig = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT || '', 10) : 5432,
  username: process.env.DB_USERNAME,
  logging: loggingLevel(),
  password: process.env.DB_PASSWORD || '',
  database: getDBName(),
  synchronize: false,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  entities: [join(__dirname, '/**/*.entity.{ts,js}')],
  extra: {
    max: poolSize,
  },
  keepConnectionAlive: process.env.NODE_ENV === 'test',
};

export default connectionConfig;
