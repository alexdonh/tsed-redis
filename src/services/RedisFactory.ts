import {isArray} from "@tsed/core";
import {Configuration, registerProvider} from "@tsed/di";
import type {RedisOptions} from "../interfaces";
import {RedisService} from "./RedisService";

export const REDIS_CONNECTIONS = Symbol.for("REDIS_CONNECTIONS");
export type REDIS_CONNECTIONS = RedisService;

function mapOptions(options: Omit<RedisOptions, "id"> | RedisOptions[]): RedisOptions[] {
  if (!options) {
    return [];
  }

  if (!isArray(options)) {
    return [
      {
        id: "default",
        ...options
      }
    ];
  }

  return options;
}

registerProvider({
  provide: REDIS_CONNECTIONS,
  injectable: false,
  deps: [Configuration, RedisService],
  async useAsyncFactory(config: Configuration, redisService: RedisService): Promise<RedisService> {
    const options = mapOptions(config.get<Omit<RedisOptions, "id"> | RedisOptions[]>("redis"));
    let isDefault = true;

    for (const current of options) {
      await redisService.connect(current.id, current, isDefault);
      isDefault = false;
    }

    return redisService;
  }
});
