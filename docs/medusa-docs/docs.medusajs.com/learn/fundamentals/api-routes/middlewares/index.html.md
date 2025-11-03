# Middlewares

In this chapter, you’ll learn about middlewares and how to create them.

## What is a Middleware?

A middleware is a function executed when a request is sent to an API Route. It's executed before the route handler function.

Middlewares are used to guard API routes, parse request content types other than `application/json`, manipulate request data, and more.

![API middleware execution flow diagram showing how HTTP requests first pass through middleware functions for authentication, validation, and data processing before reaching the actual route handler, providing a secure and flexible request processing pipeline in Medusa applications](https://res.cloudinary.com/dza7lstvk/image/upload/v1746775148/Medusa%20Book/middleware-overview_wc2ws5.jpg)

As Medusa's server is based on Express, you can use any [Express middleware](https://expressjs.com/en/resources/middleware.html).

### Middleware Types

There are two types of middlewares:

|Type|Description|Example|
|---|---|---|
|Global Middleware|A middleware that applies to all routes matching a specified pattern.|\`/custom\*\`|
|Route Middleware|A middleware that applies to routes matching a specified pattern and HTTP method(s).|A middleware that applies to all |

These middlewares generally have the same definition and usage, but they differ in the routes they apply to. You'll learn how to create both types in the following sections.

***

## How to Create a Middleware?

Middlewares of all types are defined in the special file `src/api/middlewares.ts`. Use the `defineMiddlewares` function from the Medusa Framework to define the middlewares, and export its value.

For example:

### Global Middleware

```ts title="src/api/middlewares.ts"
import { 
  defineMiddlewares,
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse, 
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom*",
      middlewares: [
        (
          req: MedusaRequest, 
          res: MedusaResponse, 
          next: MedusaNextFunction
        ) => {
          console.log("Received a request!")

          next()
        },
      ],
    },
  ],
})
```

### Route Middleware

```ts title="src/api/middlewares.ts" highlights={highlights}
import { 
  defineMiddlewares,
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse, 
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom*",
      method: ["POST", "PUT"],
      middlewares: [
        (
          req: MedusaRequest, 
          res: MedusaResponse, 
          next: MedusaNextFunction
        ) => {
          console.log("Received a request!")

          next()
        },
      ],
    },
  ],
})
```

The `defineMiddlewares` function accepts a middleware configurations object that has the property `routes`. `routes`'s value is an array of middleware route objects, each having the following properties:

- `matcher`: a string or regular expression indicating the API route path to apply the middleware on. The regular expression must be compatible with [path-to-regexp](https://github.com/pillarjs/path-to-regexp).
- `middlewares`: An array of global and route middleware functions.
- `method`: (optional) By default, a middleware is applied on all HTTP methods for a route. You can specify one or more HTTP methods to apply the middleware to in this option, making it a route middleware.

### Test the Middleware

To test the middleware:

1. Start the application:

```bash npm2yarn
npm run dev
```

2. Send a request to any API route starting with `/custom`. If you specified an HTTP method in the `method` property, make sure to use that method.
3. See the following message in the terminal:

```bash
Received a request!
```

### Troubleshooting

If the middleware didn't run, make sure you've correctly created the middleware at `src/api/middlewares.ts` (with correct spelling). This is a common mistake that can lead to the middleware not being applied, resulting in unexpected behavior.

***

## When to Use Middlewares

Middlewares are useful for:

- [Protecting API routes](https://docs.medusajs.com/learn/fundamentals/api-routes/protected-routes) to ensure that only authenticated users can access them.
- [Validating](https://docs.medusajs.com/learn/fundamentals/api-routes/validation) request query and body parameters.
- [Parsing](https://docs.medusajs.com/learn/fundamentals/api-routes/parse-body) request content types other than `application/json`.
- [Applying CORS](https://docs.medusajs.com/learn/fundamentals/api-routes/cors) configurations to custom API routes.

***

## Middleware Function Parameters

The middleware function accepts three parameters:

1. A request object of type `MedusaRequest`.
2. A response object of type `MedusaResponse`.
3. A function of type `MedusaNextFunction` that executes the next middleware in the stack.

You must call the `next` function in the middleware. Otherwise, other middlewares and the API route handler won’t execute.

For example:

```ts title="src/api/middlewares.ts"
import { 
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse, 
  defineMiddlewares,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom*",
      middlewares: [
        (
          req: MedusaRequest, 
          res: MedusaResponse, 
          next: MedusaNextFunction
        ) => {
          console.log("Received a request!", req.body)

          next()
        },
      ],
    },
  ],
})
```

This middleware logs the request body to the terminal, then calls the `next` function to execute the next middleware in the stack.

***

## Middleware for Routes with Path Parameters

To indicate a path parameter in a middleware's `matcher` pattern, use the format `:{param-name}`.

A middleware applied on a route with path parameters is a route middleware.

For example:

```ts title="src/api/middlewares.ts" collapsibleLines="1-7" expandMoreLabel="Show Imports" highlights={pathParamHighlights}
import { 
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse, 
  defineMiddlewares,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom/:id",
      middlewares: [
        // ...
      ],
    },
  ],
})
```

This applies a middleware to the routes defined in the file `src/api/custom/[id]/route.ts`.

***

## Request URLs with Trailing Backslashes

A middleware whose `matcher` pattern doesn't end with a backslash won't be applied for requests to URLs with a trailing backslash.

For example, consider you have the following middleware:

```ts title="src/api/middlewares.ts" collapsibleLines="1-7" expandMoreLabel="Show Imports"
import { 
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse, 
  defineMiddlewares,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom",
      middlewares: [
        (
          req: MedusaRequest, 
          res: MedusaResponse, 
          next: MedusaNextFunction
        ) => {
          console.log("Received a request!")

          next()
        },
      ],
    },
  ],
})
```

If you send a request to `http://localhost:9000/custom`, the middleware will run.

However, if you send a request to `http://localhost:9000/custom/`, the middleware won't run.

In general, avoid adding trailing backslashes when sending requests to API routes.

***

## How Are Middlewares Ordered and Applied?

The information explained in this section is applicable starting from [Medusa v2.6](https://github.com/medusajs/medusa/releases/tag/v2.6).

### Middleware and Routes Execution Order

The Medusa application registers middlewares and API route handlers in the following order, stacking them on top of each other:

![Diagram showcasing the order in which middlewares and route handlers are registered.](https://res.cloudinary.com/dza7lstvk/image/upload/v1746776911/Medusa%20Book/middleware-registration-overview_spc02f.jpg)

1. Global middlewares in the following order:
   1. Global middleware defined in the Medusa's core.
   2. Global middleware defined in the plugins (in the order the plugins are registered in).
   3. Global middleware you define in the application.
2. Route middlewares in the following order:
   1. Route middleware defined in the Medusa's core.
   2. Route middleware defined in the plugins (in the order the plugins are registered in).
   3. Route middleware you define in the application.
3. API routes in the following order:
   1. API routes defined in the Medusa's core.
   2. API routes defined in the plugins (in the order the plugins are registered in).
   3. API routes you define in the application.

Then, when a request is sent to an API route, the stack is executed in order: global middlewares are executed first, then the route middlewares, and finally the route handlers.

![Diagram showcasing the order in which middlewares and route handlers are executed when a request is sent to an API route.](https://res.cloudinary.com/dza7lstvk/image/upload/v1746776172/Medusa%20Book/middleware-order-overview_h7kzfl.jpg)

For example, consider you have the following middlewares:

```ts title="src/api/middlewares.ts"
export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom",
      middlewares: [
        (req, res, next) => {
          console.log("Global middleware")
          next()
        },
      ],
    },
    {
      matcher: "/custom",
      method: ["GET"],
      middlewares: [
        (req, res, next) => {
          console.log("Route middleware")
          next()
        },
      ],
    },
  ],
})
```

When you send a request to `/custom` route, the following messages are logged in the terminal:

```bash
Global middleware
Route middleware
Hello from custom! # message logged from API route handler
```

The global middleware runs first, then the route middleware, and finally the route handler, assuming that it logs the message `Hello from custom!`.

### Middlewares Sorting

On top of the previous ordering, Medusa sorts global and route middlewares based on their matcher pattern in the following order:

1. Wildcard matchers. For example, `/custom*`.
2. Regex matchers. For example, `/custom/(products|collections)`.
3. Static matchers without parameters. For example, `/custom`.
4. Static matchers with parameters. For example, `/custom/:id`.

For example, if you have the following middlewares:

```ts title="src/api/middlewares.ts"
export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom/:id",
      middlewares: [/* ... */],
    },
    {
      matcher: "/custom",
      middlewares: [/* ... */],
    },
    {
      matcher: "/custom*",
      method: ["GET"],
      middlewares: [/* ... */],
    },
    {
      matcher: "/custom/:id",
      method: ["GET"],
      middlewares: [/* ... */],
    },
  ],
})
```

The global middlewares are sorted into the following order before they're registered:

1. Global middleware `/custom`.
2. Global middleware `/custom/:id`.

And the route middlewares are sorted into the following order before they're registered:

1. Route middleware `/custom*`.
2. Route middleware `/custom/:id`.

![Diagram showcasing the order in which middlewares are sorted before being registered.](https://res.cloudinary.com/dza7lstvk/image/upload/v1746777297/Medusa%20Book/middleware-registration-sorting_oyfqhw.jpg)

Then, the middlwares are registered in the order mentioned earlier, with global middlewares first, then the route middlewares.

***

## Overriding Middlewares

A middleware can not override an existing middleware. Instead, middlewares are added to the end of the middleware stack.

For example, if you define a custom validation middleware, such as `validateAndTransformBody`, on an existing route, then both the original and the custom validation middleware will run.

Similarly, if you add an [authenticate](https://docs.medusajs.com/learn/fundamentals/api-routes/protected-routes#protect-custom-api-routes) middleware to an existing route, both the original and the custom authentication middleware will run. So, you can't override the original authentication middleware.

### Alternative Solution to Overriding Middlewares

If you need to change the middlewares applied to a route, you can create a custom [API route](https://docs.medusajs.com/learn/fundamentals/api-routes) that executes the same functionality as the original route, but with the middlewares you want.

Learn more in the [Override API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes/override) chapter.
