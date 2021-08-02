import {Constant, Inject, Service} from "@tsed/di";
import {Logger} from "@tsed/logger";
import redis, {RedisClient} from "redis";
import {RedisOptions} from "../interfaces";

@Service()
export class RedisService {
  private readonly clients: Map<string, RedisClient> = new Map();
  private defaultConnection: string = "default";

  @Inject()
  logger: Logger;

  @Constant("redis")
  redisOptions: Omit<RedisOptions, "id"> | RedisOptions[];

  async connect(id: string, options: Omit<RedisOptions, "id">, isDefault: boolean = false): Promise<RedisClient> {
    let client = this.get(id);
    if (client) {
      return client;
    }
    this.logger.info(`Connect to redis: ${id}`);
    this.logger.debug(`Options: ${JSON.stringify(options)}`);
    try {
      client = await new Promise<RedisClient>((resolve, reject) => {
        const client = redis.createClient(options);
        client.once("ready", () => {
          this.logger.info(`Redis connection ${id} is ready`);
          resolve(client);
        });
        client.once("error", (err) => {
          reject(err);
        });
      });
      this.clients.set(id, client);

      if (id === "default" || isDefault) {
        this.defaultConnection = id;
      }

      return client;
    } catch (err) {
      this.logger.error(err);
      process.exit();
    }
  }

  get(id?: string): RedisClient | undefined {
    return this.clients.get(id || this.defaultConnection);
  }

  has(id?: string): boolean {
    return this.clients.has(id || this.defaultConnection);
  }

  async close() {
    for (const [id, client] of this.clients.entries()) {
      await new Promise((resolve, reject) => {
        client.end();
        client.once("end", () => {
          this.clients.delete(id);
          resolve(true);
        });
        client.once("error", (err) => {
          reject(err);
        });
      });
    }
  }
}
