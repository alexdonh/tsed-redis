import type {ClientOpts} from "redis";

export type RedisOptions = ClientOpts & {id: string; user?: string};

declare global {
  namespace TsED {
    interface Configuration {
      redis?: Omit<RedisOptions, "id"> | RedisOptions[];
    }
  }
}
