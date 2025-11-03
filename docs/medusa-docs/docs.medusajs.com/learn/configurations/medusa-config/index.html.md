# Medusa Application Configuration

In this chapter, you'll learn available configurations in the Medusa application. You can change the application's configurations to customize the behavior of the application, its integrated modules and plugins, and more.

## Configuration File

All configurations of the Medusa application are stored in the `medusa.config.ts` file. The file exports an object created using the `defineConfig` utility. For example:

```ts title="medusa.config.ts"
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
})

```

The `defineConfig` utility accepts an object having the following properties:

- [projectConfig](#project-configurations-projectConfig): Essential configurations related to the Medusa application, such as database and CORS configurations.
- [admin](#admin-configurations-admin): Configurations related to the Medusa Admin.
- [modules](#module-configurations-modules): Configurations related to registered modules.
- [plugins](#plugin-configurations-plugins): Configurations related to registered plugins.
- [featureFlags](#feature-flags-featureFlags): Configurations to manage enabled beta features in the Medusa application.
- [logger](#custom-logger-logger): Override the default logger.

### Using Environment Variables

Notice that you use the `loadEnv` utility to load environment variables. Learn more about it in the [Environment Variables chapter](https://docs.medusajs.com/learn/fundamentals/environment-variables).

By using this utility, you can use environment variables as the values of your configurations. It's highly recommended that you use environment variables for secret values, such as API keys and database credentials, or for values that change based on the environment, such as the application's Cross Origin Resource Sharing (CORS) configurations.

For example, you can set the `DATABASE_URL` environment variable in your `.env` file:

```bash
DATABASE_URL=postgres://postgres@localhost/medusa-store
```

Then, use the value in `medusa-config.ts`:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // ...
  },
  // ...
})
```

***

## Project Configurations (`projectConfig`)

The `projectConfig` object contains essential configurations related to the Medusa application, such as database and CORS configurations.

### cookieOptions

This option is available since Medusa [v2.8.5](https://github.com/medusajs/medusa/releases/tag/v2.8.5).

The `projectConfig.cookieOptions` configuration defines cookie options to be passed to `express-session` when creating the session cookie. This configuration is useful when simulating a production environment locally, where you may need to set options like `secure` or `sameSite`. Learn more in the [Build chapter](https://docs.medusajs.com/learn/build#authentication-locally-in-production-build).

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    cookieOptions: {
      sameSite: "lax",
    },
    // ...
  },
  // ...
})
```

#### Properties

Aside from the following options, you can pass any property that the [express-session's cookie option accepts](https://www.npmjs.com/package/express-session).

- secure: (\`boolean\`)
- sameSite: (\`lax\` | \`strict\` | \`none\`)
- maxAge: (\`number\`) The maximum age of the cookie in milliseconds set in the \`Set-Cookie\` header.
- httpOnly: (\`boolean\`) Whether to set the \`HttpOnly Set-Cookie\` attribute.
- priority: (\`low\` | \`medium\` | \`high\`) The value of the \[Priority Set-Cookie attribute]\(https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1)
- domain: (\`string\`) The value of the \`Domain Set-Cookie\` attribute. By default, no domain is set, and most clients will consider the cookie to apply to the current domain only.
- path: (\`string\`) The value of the \`Path Set-Cookie\` attribute
- signed: (\`boolean\`) Whether to sign the cookie.

### databaseDriverOptions

The `projectConfig.databaseDriverOptions` configuration is an object of additional options used to configure the PostgreSQL connection. For example, you can support TLS/SSL connection using this configuration's `ssl` property.

This configuration is useful for production databases, which can be supported by setting the `rejectUnauthorized` attribute of `ssl` object to `false`. During development, it's recommended not to pass the `ssl.rejectUnauthorized` option.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    databaseDriverOptions: process.env.NODE_ENV !== "development" ?
      { connection: { ssl: { rejectUnauthorized: false } } } : {},
    // ...
  },
  // ...
})
```

When you disable `rejectUnauthorized`, make sure to also add `?ssl_mode=disable` to the end of the [databaseUrl](#databaseUrl) as well.

#### Properties

- connection: (\`object\`)

  - ssl: (\`object\` | \`boolean\`)

  - pool: (\`object\`)

    - min: (\`number\`)

    - max: (\`number\`)

    - idleTimeoutMillis: (\`number\`)

    - reapIntervalMillis: (\`number\`)

    - createRetryIntervalMillis: (\`number\`)
- idle\_in\_transaction\_session\_timeout: (\`number\`)

### databaseLogging

The `projectConfig.databaseLogging` configuration specifies whether database messages should be logged to the console. It is `false` by default.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    databaseLogging: true,
    // ...
  },
  // ...
})
```

### databaseName

The `projectConfig.databaseName` configuration determines the name of the database to connect to. If the name is specified in the [databaseUrl](#databaseUrl) configuration, you don't have to use this configuration.

After setting the database credentials, you can create and setup the database using the [db:setup](https://docs.medusajs.com/resources/medusa-cli/commands/db#dbsetup) command of the Medusa CLI.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    databaseName: process.env.DATABASE_NAME ||
      "medusa-store",
    // ...
  },
  // ...
})
```

### databaseUrl

The `projectConfig.databaseUrl` configuration specifies the PostgreSQL connection URL of the database to connect to. Its format is:

```bash
postgres://[user][:password]@[host][:port]/[dbname]
```

Where:

- `[user]`: (required) your PostgreSQL username. If not specified, the system's username is used by default. The database user that you use must have create privileges. If you're using the `postgres` superuser, then it should have these privileges by default. Otherwise, make sure to grant your user create privileges. You can learn how to do that in [PostgreSQL's documentation](https://www.postgresql.org/docs/current/ddl-priv.html).
- `[:password]`: an optional password for the user. When provided, make sure to put `:` before the password.
- `[host]`: (required) your PostgreSQL host. When run locally, it should be `localhost`.
- `[:port]`: an optional port that the PostgreSQL server is listening on. By default, it's `5432`. When provided, make sure to put `:` before the port.
- `[dbname]`: the name of the database. If not set, then you must provide the database name in the [databaseName](#databasename) configuration.

You can learn more about the connection URL format in [PostgreSQL’s documentation](https://www.postgresql.org/docs/current/libpq-connect.html).

After setting the database URL, you can create and setup the database using the [db:setup](https://docs.medusajs.com/resources/medusa-cli/commands/db#dbsetup) command of the Medusa CLI.

#### Example

For example, set the following database URL in your environment variables:

```bash
DATABASE_URL=postgres://postgres@localhost/medusa-store
```

Then, use the value in `medusa-config.ts`:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // ...
  },
  // ...
})
```

### http

The `http` configures the application's http-specific settings, such as the JWT secret, CORS configurations, and more.

#### http.jwtOptions

The `projectConfig.http.jwtOptions` configuration specifies options for the JWT token when using asymmetric signing private/public key. These options will be used for validation if `jwtVerifyOptions` is not provided.

This configuration accepts an object with the same properties as the [jsonwebtoken sign options](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback).

Learn more in the [Asymmetric Encryption chapter](https://docs.medusajs.com/learn/configurations/medusa-config/asymmetric-encryption).

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      jwtOptions: {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "medusa",
        keyid: "medusa",
      },
    },
    // ...
  },
  // ...
})
```

#### http.jwtPublicKey

The `projectConfig.http.jwtPublicKey` configuration specifies the public key used to verify the JWT token in combination with the JWT secret and the JWT options. This is only used when the JWT secret is a secret key for asymmetric validation.

It accepts one of the following values:

- A string containing the public key in PEM format.
- A `Buffer` containing the public key in PEM format.
- An object containing the following properties:
  - `key`: A string or `Buffer` containing the public key in PEM format.
  - `passphrase`: A string containing the passphrase for the public key, if applicable.

Learn more in the [Asymmetric Encryption chapter](https://docs.medusajs.com/learn/configurations/medusa-config/asymmetric-encryption).

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      jwtPublicKey: process.env.JWT_PUBLIC_KEY,
    },
    // ...
  },
  // ...
})
```

#### http.jwtSecret

The `projectConfig.http.jwtSecret` configuration is a random string used to create authentication tokens in the HTTP layer. This configuration is not required in development, but must be set in production.

In a development environment, if this option is not set the default value is `supersecret`. However, in production, if this configuration is not set, an error is thrown and the application crashes. This is to ensure that you set a secure value for the JWT secret in production.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      jwtSecret: process.env.JWT_SECRET || "supersecret",
    },
    // ...
  },
  // ...
})
```

#### http.jwtVerifyOptions

The `projectConfig.http.jwtVerifyOptions` configuration specifies options for the JWT token when using asymmetric validation private/public key.

This configuration accepts the same options as the [jsonwebtoken verify options](https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback).

Learn more in the [Asymmetric Encryption chapter](https://docs.medusajs.com/learn/configurations/medusa-config/asymmetric-encryption).

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      jwtVerifyOptions: {
        algorithms: ["RS256"],
        issuer: "medusa",
      },
    },
    // ...
  },
  // ...
})
```

#### http.jwtExpiresIn

The `projectConfig.http.jwtExpiresIn` configuration specifies the expiration time for the JWT token. Its value format is based off the [ms package](https://github.com/vercel/ms).

If not provided, the default value is `1d`.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2d",
    },
    // ...
  },
  // ...
})
```

#### http.cookieSecret

The `projectConfig.http.cookieSecret` configuration is a random string used to sign cookies in the HTTP layer. This configuration is not required in development, but must be set in production.

In a development environment, if this option is not set the default value is `supersecret`. However, in production, if this configuration is not set, an error is thrown and the application crashes. This is to ensure that you set a secure value for the cookie secret in production.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    // ...
  },
  // ...
})
```

#### http.authCors

The `projectConfig.http.authCors` configuration specifies the accepted URLs or patterns for API routes starting with `/auth`. It can either be one accepted origin, or a comma-separated list of accepted origins.

Every origin in that list must either be:

- A full URL. For example, `http://localhost:7001`. The URL must not end with a backslash;
- Or a regular expression pattern that can match more than one origin. For example, `.example.com`. The regex pattern that Medusa tests for is `^([\/~@;%#'])(.*?)\1([gimsuy]*)$`.

Since the `/auth` routes are used for authentication for both store and admin routes, it's recommended to set this configuration's value to a combination of the [storeCors](#httpstoreCors) and [adminCors](#httpadminCors) configurations.

Some example values of common use cases:

```bash
# Allow different ports locally starting with 700
AUTH_CORS=/http:\/\/localhost:700\d+$/

# Allow any origin ending with vercel.app. For example, admin.vercel.app
AUTH_CORS=/vercel\.app$/

# Allow all HTTP requests
AUTH_CORS=/http:\/\/.+/
```

Then, set the configuration in `medusa-config.ts`:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      authCors: process.env.AUTH_CORS,
    },
    // ...
  },
  // ...
})
```

If you’re adding the value directly within `medusa-config.ts`, make sure to add an extra escaping `/` for every backslash in the pattern. For example:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      authCors: "/http:\\/\\/localhost:700\\d+$/",
    },
    // ...
  },
  // ...
})
```

#### http.storeCors

The `projectConfig.http.storeCors` configuration specifies the accepted URLs or patterns for API routes starting with `/store`. It can either be one accepted origin, or a comma-separated list of accepted origins.

Every origin in that list must either be:

- A full URL. For example, `http://localhost:7001`. The URL must not end with a backslash;
- Or a regular expression pattern that can match more than one origin. For example, `.example.com`. The regex pattern that Medusa tests for is `^([\/~@;%#'])(.*?)\1([gimsuy]*)$`.

Some example values of common use cases:

```bash
# Allow different ports locally starting with 800
STORE_CORS=/http:\/\/localhost:800\d+$/

# Allow any origin ending with vercel.app. For example, storefront.vercel.app
STORE_CORS=/vercel\.app$/

# Allow all HTTP requests
STORE_CORS=/http:\/\/.+/
```

Then, set the configuration in `medusa-config.ts`:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      storeCors: process.env.STORE_CORS,
    },
    // ...
  },
  // ...
})
```

If you’re adding the value directly within `medusa-config.ts`, make sure to add an extra escaping `/` for every backslash in the pattern. For example:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      storeCors: "/vercel\\.app$/",
    },
    // ...
  },
  // ...
})
```

#### http.adminCors

The `projectConfig.http.adminCors` configuration specifies the accepted URLs or patterns for API routes starting with `/admin`. It can either be one accepted origin, or a comma-separated list of accepted origins.

Every origin in that list must either be:

- A full URL. For example, `http://localhost:7001`. The URL must not end with a backslash;
- Or a regular expression pattern that can match more than one origin. For example, `.example.com`. The regex pattern that Medusa tests for is `^([\/~@;%#'])(.*?)\1([gimsuy]*)$`.

Some example values of common use cases:

```bash
# Allow different ports locally starting with 700
ADMIN_CORS=/http:\/\/localhost:700\d+$/

# Allow any origin ending with vercel.app. For example, admin.vercel.app
ADMIN_CORS=/vercel\.app$/

# Allow all HTTP requests
ADMIN_CORS=/http:\/\/.+/
```

Then, set the configuration in `medusa-config.ts`:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      adminCors: process.env.ADMIN_CORS,
    },
    // ...
  },
  // ...
})
```

If you’re adding the value directly within `medusa-config.ts`, make sure to add an extra escaping `/` for every backslash in the pattern. For example:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      adminCors: "/vercel\\.app$/",
    },
    // ...
  },
  // ...
})
```

#### http.compression

The `projectConfig.http.compression` configuration modifies the HTTP compression settings at the application layer. If you have access to the HTTP server, the recommended approach would be to enable it there. However, some platforms don't offer access to the HTTP layer and in those cases, this is a good alternative.

If you enable HTTP compression and you want to disable it for specific API Routes, you can pass in the request header `"x-no-compression": true`. Learn more in the [API Reference](https://docs.medusajs.com/api/store#http-compression).

For example:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      compression: {
        enabled: true,
        level: 6,
        memLevel: 8,
        threshold: 1024,
      },
    },
    // ...
  },
  // ...
})
```

This configuation is an object that accepts the following properties:

- enabled: (\`boolean\`)
- level: (\`number\`) The level of zlib compression to apply to responses. A higher level will result in better compression but will take longer to complete. A lower level will result in less compression but will be much faster.
- memLevel: (\`number\`) How much memory should be allocated to the internal compression state. It value is between \`1\` (minimum level) and \`9\` (maximum level).
- threshold: (\`number\` | \`string\`) The minimum response body size that compression is applied on. Its value can be the number of bytes or any string accepted by the \[bytes]\(https://www.npmjs.com/package/bytes) package.

#### http.authMethodsPerActor

The `projectConfig.http.authMethodsPerActor` configuration specifies the supported authentication providers per actor type (such as `user`, `customer`, or any custom actor).

For example, you can allow Google login for `customers`, and allow email/password logins for `users` in the admin.

`authMethodsPerActor` is a an object whose key is the actor type (for example, `user`), and the value is an array of supported auth provider IDs (for example, `emailpass`).

Learn more about actor types in the [Auth Identity and Actor Type documentation](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types).

For example:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      authMethodsPerActor: {
        user: ["emailpass"],
        customer: ["emailpass", "google"],
      },
    },
    // ...
  },
  // ...
})
```

The above configurations allow admin users to login using email/password, and customers to login using email/password and Google.

#### http.restrictedFields

The `projectConfig.http.restrictedFields` configuration specifies the fields that can't be selected in API routes (using the `fields` query parameter) unless they're allowed in the [request's Query configurations](https://docs.medusajs.com/learn/fundamentals/module-links/query#request-query-configurations). This is useful to restrict sensitive fields from being exposed in the API.

For example, you can restrict selecting customers in store API routes:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    http: {
      restrictedFields: {
        store: ["customer", "customers"],
      },
    },
    // ...
  },
  // ...
})
```

The `restrictedFields` configuration accepts the following properties:

- store: (\`string\[]\`)

### redisOptions

The `projectConfig.redisOptions` configuration defines options to pass to `ioredis`, which creates the Redis connection used to store the Medusa server session. Refer to [ioredis’s RedisOptions documentation](https://redis.github.io/ioredis/index.html#RedisOptions)
for the list of available options.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    redisOptions: {
      connectionName: process.env.REDIS_CONNECTION_NAME ||
        "medusa",
    },
    // ...
  },
  // ...
})
```

### redisPrefix

The `projectConfig.redisPrefix` configuration defines a prefix on all keys stored in Redis for the Medusa server session. The default value is `sess:`.

The value of this configuration is prepended to `sess:`. For example, if you set it to `medusa:`, then a key stored in Redis is prefixed by `medusa:sess`.

This configuration is not used for modules that also connect to Redis, such as the [Redis Caching Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/caching/providers/redis).

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    redisPrefix: process.env.REDIS_URL || "medusa:",
    // ...
  },
  // ...
})
```

### redisUrl

The `projectConfig.redisUrl` configuration specifies the connection URL to Redis to store the Medusa server session. When specified, the Medusa server uses Redis to store the session data. Otherwise, the session data is stored in-memory.

This configuration is not used for modules that also connect to Redis, such as the [Redis Caching Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/caching/providers/redis). You'll have to configure the Redis connection for those modules separately.

You must first have Redis installed. You can refer to [Redis's installation guide](https://redis.io/docs/getting-started/installation/).

The Redis connection URL has the following format:

```bash
redis[s]://[[username][:password]@][host][:port][/db-number]
```

Where:

- `redis[s]`: the protocol used to connect to Redis. Use `rediss` for a secure connection.
- `[[username][:password]@]`: an optional username and password for the Redis server.
- `[host]`: the host of the Redis server. When run locally, it should be `localhost`.
- `[:port]`: an optional port that the Redis server is listening on. By default, it's `6379`.
- `[/db-number]`: an optional database number to connect to. By default, it's `0`.

For a local Redis installation, the connection URL should be `redis://localhost:6379` unless you’ve made any changes to the Redis configuration during installation.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    redisUrl: process.env.REDIS_URL ||
      "redis://localhost:6379",
    // ...
  },
  // ...
})
```

### sessionOptions

The `projectConfig.sessionOptions` configuration defines additional options to pass to [express-session](https://www.npmjs.com/package/express-session), which is used to store the Medusa server session.

This configuration is not used for modules that also connect to Redis, such as the [Redis Caching Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/caching/providers/redis).

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    sessionOptions: {
      name: process.env.SESSION_NAME || "custom",
    },
    // ...
  },
  // ...
})
```

#### Properties

- name: (\`string\`)
- resave: (\`boolean\`)
- rolling: (\`boolean\`)
- saveUninitialized: (\`boolean\`)
- secret: (\`string\`) The secret to sign the session ID cookie. By default, the value of \[http.cookieSecret]\(#httpcookieSecret) is used. Refer to \[express-session’s documentation]\(https://www.npmjs.com/package/express-session#secret) for details.
- ttl: (\`number\`) The time-to-live (TTL) of the session ID cookie in milliseconds. It is used when calculating the \`Expires\` \`Set-Cookie\` attribute of cookies. Refer to \[express-session’s documentation]\(https://www.npmjs.com/package/express-session#cookie) for more details.

### workerMode

The `projectConfig.workerMode` configuration specifies the worker mode of the Medusa application. You can learn more about it in the [Worker Mode chapter](https://docs.medusajs.com/learn/production/worker-mode).

The value for this configuration can be one of the following:

- `shared`: run the application in a single process, meaning the worker and server run in the same process.
- `worker`: run the a worker process only.
- `server`: run the application server only.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  projectConfig: {
    workerMode: process.env.WORKER_MODE as "shared" | "worker" | "server" || "shared",
    // ...
  },
  // ...
})
```

***

## Admin Configurations (`admin`)

The `admin` object contains configurations related to the Medusa Admin.

### backendUrl

The `admin.backendUrl` configuration specifies the URL of the Medusa application. Its default value is the browser origin. This is useful to set when running the admin on a separate domain.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL ||
      "http://localhost:9000",
  },
  // ...
})
```

### disable

The `admin.disable` configuration specifies whether to disable the Medusa Admin. If disabled, the Medusa Admin will not be compiled and you can't access it at `/app` path of your application. The default value is `false`.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  admin: {
    disable: process.env.ADMIN_DISABLED === "true" ||
      false,
  },
  // ...
})
```

### path

The `admin.path` configuration indicates the path to the admin dashboard, which is `/app` by default. The value must start with `/` and can't end with a `/`.

The value cannot be one of the reserved paths:

- `/admin`
- `/store`
- `/auth`
- `/`

When using Docker, make sure that the root path of the Docker image isn't the same as the admin's path. For example, if the Docker image's root path is `/app`, change
the value of the `admin.path` configuration, since it's `/app` by default.

#### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  admin: {
    path: process.env.ADMIN_PATH || `/app`,
  },
  // ...
})
```

### storefrontUrl

The `admin.storefrontUrl` configuration specifies the URL of the Medusa storefront application. This URL is used as a prefix to some links in the admin that require performing actions in the storefront.

For example, this URL is used as a prefix to shareable payment links for orders with outstanding amounts.

#### Example

```js title="medusa-config.js"
module.exports = defineConfig({
  admin: {
    storefrontUrl: process.env.MEDUSA_STOREFRONT_URL ||
      "http://localhost:8000",
  },
  // ...
})
```

### vite

The `admin.vite` configration specifies Vite configurations for the Medusa Admin. Its value is a function that receives the default Vite configuration and returns the modified configuration. The default value is `undefined`.

Learn about configurations you can pass to Vite in [Vite's documentation](https://vite.dev/config/).

#### Example

For example, if you're using a third-party library that isn't ESM-compatible, add it to Vite's `optimizeDeps` configuration:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  admin: {
    vite: (config) => {
      return {
        ...config,
        optimizeDeps: {
          include: ["qs"],
        },
      }
    },
  },
  // ...
})
```

***

## Module Configurations (`modules`)

The `modules` configuration allows you to register and configure the [modules](https://docs.medusajs.com/learn/fundamentals/modules) registered in the Medusa application. Medusa's commerce and Infrastructure Modules are configured by default. So, you only need to pass your custom modules, or override the default configurations of the existing modules.

`modules` is an array of objects for the modules to register. Each object has the following properties:

1. `resolve`: a string indicating the path to the module, or the module's NPM package name. For example, `./src/modules/my-module`.
2. `options`: (optional) an object indicating the [options to pass to the module](https://docs.medusajs.com/learn/fundamentals/modules/options). This object is specific to the module and its configurations. For example, your module may require an API key option, which you can pass in this object.

For modules that are part of a plugin, learn about registering them in the [Register Modules in Plugins](#register-modules-in-plugins) section.

### Example

To register a custom module:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  modules: [
    {
      resolve: "./src/modules/cms",
      options: {
        apiKey: process.env.CMS_API_KEY,
      },
    },
  ],
  // ...
})
```

You can also override the default configurations of Medusa's modules. For example, to add a Notification Module Provider to the Notification Module:

```ts title="medusa-config.ts"
module.exports = defineConfig({
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              name: "Local Notification Provider",
              channels: ["feed"],
            },
          },
          // custom provider
          {
            resolve: "./src/modules/my-notification",
            id: "my-notification",
            options: {
              channels: ["email"],
              // provider options...
            },
          },
        ],
      },
    },
  ],
  // ...
})
```

***

## Plugin Configurations (`plugins`)

The `plugins` configuration allows you to register and configure the [plugins](https://docs.medusajs.com/learn/fundamentals/plugins) registered in the Medusa application. Plugins include re-usable Medusa customizations, such as modules, workflows, API routes, and more.

Aside from installing the plugin with NPM, you must also register it in the `medusa.config.ts` file.

The `plugins` configuration is an array of objects for the plugins to register. Each object has the following properties:

- A string, which is the name of the plugin's package as specified in the plugin's `package.json` file. This is useful if the plugin doesn't require any options.
- An object having the following properties:
  - `resolve`: The name of the plugin's package as specified in the plugin's `package.json` file.
  - `options`: An object that includes [options to be passed to the modules](https://docs.medusajs.com/learn/fundamentals/modules/options#pass-options-to-a-module-in-a-plugin) within the plugin.

### Example

```ts title="medusa-config.ts"
module.exports = {
  plugins: [
    `medusa-my-plugin-1`,
    {
      resolve: `medusa-my-plugin`,
      options: {
        apiKey: process.env.MY_API_KEY ||
          `test`,
      },
    },
    // ...
  ],
  // ...
}
```

The above configuration registers two plugins: `medusa-my-plugin-1` and `medusa-my-plugin`. The latter plugin requires an API key option, which is passed in the `options` object.

### Register Modules in Plugins

When you register a plugin, its modules are automatically registered in the Medusa application. You don't have to register them manually in the `modules` configuration.

However, this isn't the case for module providers. If your plugin includes a module provider, you must register it in the `modules` configuration, referencing the module provider's path.

For example:

```ts title="medusa-config.ts"
module.exports = {
  plugins: [
    `medusa-my-plugin`,
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          // ...
          {
            resolve: "medusa-my-plugin/providers/my-notification",
            id: "my-notification",
            options: {
              channels: ["email"],
              // provider options...
            },
          },
        ],
      },
    },
  ],
  // ...
}
```

***

## Feature Flags (`featureFlags`)

The `featureFlags` configuration allows you to manage enabled beta features in the Medusa application.

Learn more in the [Feature Flags](https://docs.medusajs.com/learn/debugging-and-testing/feature-flags) chapter.

### Example

```ts title="medusa-config.ts"
module.exports = defineConfig({
  featureFlags: {
    index_engine: true,
    // ...
  },
  // ...
})
```

***

## Custom Logger (`logger`)

The `logger` configuration allows you to override the default [Logger](https://docs.medusajs.com/learn/debugging-and-testing/logging) used in the Medusa application with your custom implementation.

Learn more about creating a custom logger in the [Override Logger](https://docs.medusajs.com/learn/debugging-and-testing/logging/custom-logger) chapter.

The `logger` configuration accepts an instance of a class that extends the `Logger` interface.

### Example

```ts title="medusa-config.ts"
import { logger } from "./src/logger/my-logger"

module.exports = defineConfig({
  // ...
  logger,
})
```
