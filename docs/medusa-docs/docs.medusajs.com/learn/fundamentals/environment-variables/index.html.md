# Environment Variables

In this chapter, you'll learn how environment variables are loaded in Medusa.

## System Environment Variables

The Medusa application loads and uses system environment variables.

For example, if you set the `PORT` environment variable to `8000`, the Medusa application runs on that port instead of `9000`.

In production, you should always use system environment variables that you set through your hosting provider.

***

## Environment Variables in .env Files

During development, it's easier to set environment variables in a `.env` file in your repository.

Based on your `NODE_ENV` system environment variable, Medusa will try to load environment variables from the following `.env` files:

As of [Medusa v2.5.0](https://github.com/medusajs/medusa/releases/tag/v2.5.0), `NODE_ENV` defaults to `production` when using `medusa start`. Otherwise, it defaults to `development`.

|\`.env\`|
|---|---|
|\`NODE\_ENV\`|\`.env\`|
|\`NODE\_ENV\`|\`.env.production\`|
|\`NODE\_ENV\`|\`.env.staging\`|
|\`NODE\_ENV\`|\`.env.test\`|

### Set Environment in `loadEnv`

In the `medusa-config.ts` file of your Medusa application, you'll find a `loadEnv` function used that accepts `process.env.NODE_ENV` as a first parameter.

This function is responsible for loading the correct `.env` file based on the value of `process.env.NODE_ENV`.

To ensure that the correct `.env` file is loaded as shown in the table above, only specify `development`, `production`, `staging` or `test` as the value of `process.env.NODE_ENV` or as the parameter of `loadEnv`.

***

## Environment Variables for Admin Customizations

Since the Medusa Admin is built on top of [Vite](https://vite.dev/), you prefix the environment variables you want to use in a widget or UI route with `VITE_`. Then, you can access or use them with the `import.meta.env` object.

Learn more in the [Admin Environment Variables](https://docs.medusajs.com/learn/fundamentals/admin/environment-variables) chapter.

***

## Predefined Medusa Environment Variables

The Medusa application uses the following predefined environment variables that you can set:

You should opt for setting configurations in `medusa-config.ts` where possible. For a full list of Medusa configurations, refer to the [Medusa Configurations chapter](https://docs.medusajs.com/learn/configurations/medusa-config).

|Environment Variable|Description|Default|
|---|---|---|
|\`HOST\`|The host to run the Medusa application on.|\`localhost\`|
|\`PORT\`|The port to run the Medusa application on.|\`9000\`|
|\`DATABASE\_URL\`|The URL to connect to the PostgreSQL database. Only used if |\`postgres://localhost/medusa-starter-default\`|
|\`STORE\_CORS\`|URLs of storefronts that can access the Medusa backend's Store APIs. Only used if |\`http://localhost:8000\`|
||URLs of admin dashboards that can access the Medusa backend's Admin APIs. Only used if |\`http://localhost:7000,http://localhost:7001,http://localhost:5173\`|
||URLs of clients that can access the Medusa backend's authentication routes. Only used if |\`http://localhost:7000,http://localhost:7001,http://localhost:5173\`|
||A random string used to create authentication tokens in the http layer. Only used if |-|
|\`COOKIE\_SECRET\`|A random string used to create cookie tokens in the http layer. Only used if |-|
|\`MEDUSA\_BACKEND\_URL\`|The URL to the Medusa backend. Only used if |-|
|\`DB\_HOST\`|The host for the database. It's used when generating migrations for a plugin, and when running integration tests.|\`localhost\`|
|\`DB\_USERNAME\`|The username for the database. It's used when generating migrations for a plugin, and when running integration tests.|-|
|\`DB\_PASSWORD\`|The password for the database user. It's used when generating migrations for a plugin, and when running integration tests.|-|
|\`DB\_TEMP\_NAME\`|The database name to create for integration tests.|-|
|\`LOG\_LEVEL\`|The allowed levels to log. Learn more in the |\`silly\`|
|\`LOG\_FILE\`|The file to save logs in. By default, logs aren't saved in any file. Learn more in the |-|
|\`MEDUSA\_DISABLE\_TELEMETRY\`|Whether to disable analytics data collection. Learn more in the |-|
