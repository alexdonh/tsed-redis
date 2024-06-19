import type {RedisClientOptions, RedisClientType, RedisFunctions, RedisModules, RedisScripts} from "redis";

export type NodeRedisOptions = RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
export type NodeRedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
