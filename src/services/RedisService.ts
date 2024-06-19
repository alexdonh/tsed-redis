import {Constant, Inject, OnDestroy, Service} from "@tsed/di";
import {Logger} from "@tsed/logger";
import type {IORedisClient, NodeRedisClient, RedisClient, RedisProvider, WithId, WithProvider} from "../interfaces";

@Service()
export class RedisService implements OnDestroy {
  private readonly clients: Map<string, RedisClient<RedisProvider>> = new Map();
  private defaultConnection: string = "default";

  @Inject()
  logger: Logger;

  @Constant("redis")
  redisOptions: WithProvider<RedisProvider> | WithProvider<RedisProvider, WithId<RedisProvider>>[];

  async $onDestroy() {
    await this.close();
  }

  async _nodeRedisConnect(settings: WithId<"redis">): Promise<RedisClient<"redis">> {
    const {createClient} = await import("redis");
    const {id, ...opts} = settings;
    const client = createClient(opts);

    client.once("error", (err) => {
      this.logger.error(`Connection to redis ${id} was failed`);
      this.logger.error(err);
      process.exit();
    });

    client.once("ready", () => {
      this.logger.info(`Connection to redis ${id} is ready`);
    });

    await client.connect();

    return client;
  }

  async _ioRedisConnect(settings: WithId<"ioredis">): Promise<RedisClient<"ioredis">> {
    const {Redis} = await import("ioredis");
    const {id, ...opts} = settings;

    const reconnectOnError = (err: any) => {
      this.logger.error(`Connection to ioredis ${id} was failed`);
      this.logger.error(err);
      process.exit();
    };

    const client = new Redis({
      ...opts,
      reconnectOnError,
      lazyConnect: true
    });

    await client.connect();

    this.logger.info(`Connection to ioredis ${id} is ready`);

    return client;
  }

  async connect<O extends WithProvider<P, WithId<P>>, P extends RedisProvider = RedisProvider>(
    id: string,
    options: O,
    isDefault: boolean = false
  ): Promise<RedisClient<P>> {
    let client = this.get<P>(id);
    const isReady = (client as NodeRedisClient)?.isReady || (client as IORedisClient)?.status === "ready";
    if (client && isReady) {
      return client as RedisClient<P>;
    }

    switch (options.provider) {
      case "redis":
        client = (await this._nodeRedisConnect(options as WithId<"redis">)) as RedisClient<P>;
        break;
      case "ioredis":
        client = (await this._ioRedisConnect(options as WithId<"ioredis">)) as RedisClient<P>;
        break;
      default:
        throw new Error(`Redis provider ${options.provider} not supported`);
    }

    if (id === "default" || isDefault) {
      this.defaultConnection = id;
    }

    this.clients.set(id, client);

    return client;
  }

  get<P extends RedisProvider>(id?: string): RedisClient<P> | undefined {
    return this.clients.get(id || this.defaultConnection) as RedisClient<P>;
  }

  has(id?: string): boolean {
    return this.clients.has(id || this.defaultConnection);
  }

  async close() {
    await Promise.all(Array.from(this.clients, ([, c]) => c.disconnect()));
    this.clients.clear();
  }
}
