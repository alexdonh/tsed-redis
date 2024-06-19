# tsed-redis

Simple Redis DI factory for Ts.ED framework

## Goals

Just kind of a wrapper to [redis](https://github.com/redis/node-redis) or [ioredis](https://github.com/redis/ioredis) for Ts.ED framework. With support of multiple connections.

## Installation

```sh
npm install tsed-redis
// or yarn
yarn add tsed-redis
```

It now supports both `redis` v4+ and `ioredis` v5+. You will have to install one of those optional dependencies as your choice!

```sh
npm install redis@^3.1.2
// or yarn
yarn add redis@^3.1.2
```

or

```sh
npm install ioredis@^5.4.1
// or yarn
yarn add ioredis@^5.4.1
```

## Usage

```typescript
import "tsed-redis";
import type { WithProvider, WithId } from "tsed-redis";

@Configuration({
  ...
  // can be redis options
  redis: <WithProvider<"redis", WithId<"redis">>>{
    provider: "redis"
    url: "redis://localhost:6379"
    // <other redis configurations>
  }
  
  // or ioredis config
  // redis: <WithProvider<"ioredis", WithId<"ioredis">>>{
  //   provider: "ioredis"
  //   host: "localhost",
  //   port: 6379
  //   // <other ioredis configurations>
  // }

  // or even multiple connections (id is required)
  // redis: [
  //   {
  //     id: "foo",
  //     url: "...",
  //   },
  //   {
  //     id: "bar",
  //     host: "...",
  //     port: ...
  //   }
  // ]
})
export class Server {
  ...
}
```

Check their documentation for more configurations:
- [redis](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)
- [ioredis](https://redis.github.io/ioredis/index.html#RedisOptions)

Then, in service code you will `@Inject` redis service like this:

```typescript
import { RedisService } from "tsed-redis";

@Controller("/hello-world")
export class HelloWorldController {

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Get("/")
  async get() {
    // get a redis connection, provide `id` to get a specific connection
    // id must match with what was specified in configuration.
    // must supply a provider type `redis` or `ioredis`
    const client = this.redisService.get<"ioredis">();
    // use redis API set
    await client?.set("foo", "bar");
    // and get
    await client?.get("foo"); // should return bar
    return "hello";
  }
}

```

## Credits

- [Me](https://github.com/alexdonh)
- [Ts.ED](https://github.com/tsedio/tsed) for the awesome Typescript framework
- [Node-Redis](https://github.com/redis/node-redis)
- [ioredis](https://github.com/redis/ioredis)

## License

MIT License

Copyright (c) 2021-2024 Alex Do

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
