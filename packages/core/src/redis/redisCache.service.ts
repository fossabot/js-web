import { Cache, CachingConfig, Store } from 'cache-manager';
import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'redis';

interface RedisStore extends Store {
  name: 'redis';
  getClient: () => Redis.RedisClient;
}
interface RedisCache extends Cache {
  store: RedisStore;
}

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: RedisCache) {}

  onModuleDestroy() {
    this.cache.store.getClient().quit();
  }

  async get<T>(key: string) {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, options?: CachingConfig) {
    await this.cache.set<T>(key, value, options);
  }

  async del(key: string) {
    return this.cache.del(key);
  }
}
