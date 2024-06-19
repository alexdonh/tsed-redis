import {isArray} from "@tsed/core";
import {Configuration, registerProvider} from "@tsed/di";
import {Logger} from "@tsed/logger";
import type {RedisProvider, WithId, WithProvider} from "../interfaces";
import {RedisService} from "./RedisService";

export const REDIS_CONNECTIONS = Symbol.for("REDIS_CONNECTIONS");
export type REDIS_CONNECTIONS = RedisService;

function mapOptions(
  options: WithProvider<RedisProvider> | WithProvider<RedisProvider, WithId<RedisProvider>>[]
): WithProvider<RedisProvider, WithId<RedisProvider>>[] {
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
  deps: [Configuration, Logger, RedisService],
  async useAsyncFactory(config: Configuration, logger: Logger, redisService: RedisService): Promise<RedisService> {
    const options = mapOptions(config.get<WithProvider<RedisProvider> | WithProvider<RedisProvider, WithId<RedisProvider>>[]>("redis"));
    let isDefault = true;

    for (const current of options) {
      await redisService.connect(current.id, current, isDefault);
      isDefault = false;
    }

    return redisService;
  }
});
