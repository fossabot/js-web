import { Injectable } from '@nestjs/common';
import QueryStream from 'pg-query-stream';
import { Migratable } from '../utils/migratable';

@Injectable()
export class QueryStreamingService {
  async initStream(stream: QueryStream, migratableService: Migratable<any>) {
    await migratableService.setup();

    return new Promise((resolve, reject) => {
      stream.on('readable', async () => {
        let row: Record<string, any> = stream.read();
        while (row !== null) {
          await migratableService.migrate(row);
          row = stream.read();
        }
      });
      stream.on('end', async () => {
        await migratableService.done();
        setTimeout(resolve, 100); // give a little more time for stream to terminate gracefully
      });
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
