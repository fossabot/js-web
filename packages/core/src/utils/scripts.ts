import { ConnectionOptions, createConnection } from 'typeorm';
import yargs from 'yargs';
import connectionConfig from '../connection';

yargs
  .help()
  // WARNING: You will loose all data in your current database.
  .command('reset', 'Revert all migrations.', async () => {
    const connection = await createConnection(
      connectionConfig as ConnectionOptions,
    );
    const queryRunner = connection.createQueryRunner();

    const result: { count: number }[] = await queryRunner.query(
      'SELECT COUNT("id") AS "count" FROM "migrations"',
    );

    const migrationCount = result[0]?.count || 0;

    // eslint-disable-next-line no-restricted-syntax, @typescript-eslint/no-unused-vars
    for (const _index of [...Array.from({ length: migrationCount }).keys()]) {
      await connection.undoLastMigration();
    }

    connection.close();
    process.exit(0);
  })
  .parse();
