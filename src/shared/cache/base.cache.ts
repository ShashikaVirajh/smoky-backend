import { Logger } from '@library/logger.library';
import { config } from '@root/config';
import BunyanLogger from 'bunyan';
import { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
  client: RedisClient;
  log: BunyanLogger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = Logger.create(`${cacheName}-cache`);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.log.error(error);
    });
  }
}
