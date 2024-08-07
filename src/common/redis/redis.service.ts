import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async onModuleInit() {
    this.logger.log('Redis client connected');
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async set(key: string, value: any, ttl: number = 600): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    } else {
      await this.redisClient.set(key, JSON.stringify(value));
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.redisClient.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
