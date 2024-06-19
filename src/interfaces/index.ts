import {IORedisClient, IORedisOptions} from "./ioredis";
import {NodeRedisClient, NodeRedisOptions} from "./redis";

export * from "./ioredis";
export * from "./redis";

export type RedisProvider = "redis" | "ioredis";
export type RedisOptions<P extends RedisProvider> = P extends "redis" ? NodeRedisOptions : IORedisOptions;
export type RedisClient<P extends RedisProvider> = P extends "redis" ? NodeRedisClient : IORedisClient;
export type RedisClients = {
  [P in RedisProvider]: RedisClient<P>;
};

export type WithId<P extends RedisProvider = RedisProvider, T extends RedisOptions<RedisProvider> = RedisOptions<P>> = T & {
  id: string;
};
export type WithProvider<P extends RedisProvider = RedisProvider, T extends RedisOptions<RedisProvider> = RedisOptions<P>> = T & {
  provider: P;
};

declare global {
  namespace TsED {
    interface Configuration {
      redis?: WithProvider<RedisProvider> | WithProvider<RedisProvider, WithId<RedisProvider>>[];
    }
  }
}
