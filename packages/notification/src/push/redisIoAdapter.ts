import { createClient, RedisClientOptions } from 'redis';
import { ServerOptions } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAdapter, RedisAdapter } from '@socket.io/redis-adapter';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: (nsp: unknown) => RedisAdapter;

  constructor(
    app: INestApplication,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const url = `redis://${this.configService.get('REDIS_HOST')}:${Number(
      this.configService.get('REDIS_PORT'),
    )}`;

    const password = this.configService.get('REDIS_AUTH_PASS');
    const options: RedisClientOptions = password ? { url, password } : { url };

    const pubClient = createClient(options);
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);

    return server;
  }
}
