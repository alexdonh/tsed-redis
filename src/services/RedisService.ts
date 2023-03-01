import {Constant, Inject, Service} from "@tsed/di";
import {Logger} from "@tsed/logger";
import {createClient, RedisClientOptions, RedisClientType} from "redis";
import type {RedisClientOptionsWithId} from "../interfaces";

@Service()
export class RedisService {
  private readonly clients: Map<string, RedisClientType> = new Map();
  private defaultConnection: string = "default";

  @Inject()
  logger: Logger;

  @Constant("redis")
  redisOptions: RedisClientOptions | RedisClientOptionsWithId[];

  async connect(id: string, options: RedisClientOptions, isDefault: boolean = false): Promise<RedisClientType> {
    let client = this.get(id);
    if (client && client.isReady) {
      return client;
    }

    this.logger.info(`Connect to redis ${id}`);
    this.logger.debug(`Options: ${JSON.stringify(options)}`);

    client = <RedisClientType>createClient(options);

    if (!client) {
      this.logger.error("Could not create redis client");
      process.exit();
    }

    client.once("error", (err) => {
      this.logger.error(`Connection to redis ${id} was failed`);
      this.logger.error(err);
      process.exit();
    });

    client.once("ready", () => {
      this.logger.info(`Connection to redis ${id} is ready`);
    });

    await client.connect();

    if (id === "default" || isDefault) {
      this.defaultConnection = id;
    }

    this.clients.set(id, client);

    return client;
  }

  get(id?: string): RedisClientType | undefined {
    return this.clients.get(id || this.defaultConnection);
  }

  has(id?: string): boolean {
    return this.clients.has(id || this.defaultConnection);
  }

  async close() {
    for (const [id, client] of this.clients.entries()) {
      await client.disconnect();
      this.clients.delete(id);
    }
  }
}
