import type {RedisClientOptions} from "redis";

export type RedisClientOptionsWithId = RedisClientOptions & {id: string};

declare global {
  namespace TsED {
    interface Configuration {
      redis?: RedisClientOptions | RedisClientOptionsWithId[];
    }
  }
}
