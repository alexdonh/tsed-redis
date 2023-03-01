# tsed-redis

Simple Redis DI factory for Ts.ED framework

## Goals

Just kind of a wrapper to [redis](https://github.com/redis/node-redis) for Ts.ED framework. With support of multiple connections.

## Installation

```sh
npm install tsed-redis redis
// or yarn
yarn add tsed-redis redis
```

(Yes, redis is a must!)

## Usage

```typescript
import "tsed-redis";

@Configuration({
  ...
  redis: {
    url: "redis://localhost:6379",
    // <other redis configurations>
  }
  // or multiple connections (id is required)
  // redis: [
  //   {
  //     id: "foo",
  //     url: "...",
  //   },
  //   {
  //     id: "bar",
  //     url: "...",
  //   }
  // ]
})
export class Server {
  ...
}
```

More redis configuration can be found [here](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md).

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
    const client = this.redisService.get();
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
- [Redis for Node.js](https://github.com/redis/node-redis)

## License

MIT License

Copyright (c) 2021 Alex Do

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
