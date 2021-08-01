import type {ClientOpts} from "redis";

export type RedisOptions = ClientOpts & {user?: string};

declare global {
  namespace TsED {
    interface Configuration {
      redis?: RedisOptions;
    }
  }
}
