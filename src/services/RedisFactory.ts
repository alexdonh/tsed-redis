import {Configuration, registerProvider} from "@tsed/di";
import {Logger} from "@tsed/logger";
import redis, {RedisClient} from "redis";
import type {RedisOptions} from "../interfaces";

registerProvider({
  provide: RedisClient,
  deps: [Logger, Configuration],
  useFactory(logger: Logger, config: Configuration): RedisClient {
    const options = config.get<RedisOptions>("redis", {} as RedisOptions);

    logger.info("Connect to redis server");
    logger.debug(`Options: ${JSON.stringify(options)}`);

    try {
      const client = redis.createClient(options);
      client.on("ready", () => {
        logger.info("Redis server is ready");
      });
      return client;
    } catch (err) {
      logger.error(err);
      process.exit();
    }
  }
});
