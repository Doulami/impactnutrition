# Throwing and Handling Errors

In this guide, you'll learn how to throw errors in your Medusa application, how it affects an API route's response, and how to change the default error handler of your Medusa application.

## Throw MedusaError

When throwing an error in your API routes, middlewares, workflows, or any customization, throw a `MedusaError` from the Medusa Framework.

The Medusa application's API route error handler then wraps your thrown error in a uniform object and returns it in the response.

For example:

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  if (!req.query.q) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "The `q` query parameter is required."
    )
  }

  // ...
}
```

The `MedusaError` class accepts two parameters in its constructor:

1. The first is the error's type. `MedusaError` has a static property `Types` that you can use. `Types` is an enum whose possible values are explained in the next section.
2. The second is the message to show in the error response.

### Error Object in Response

The error object returned in the response has three properties:

- `type`: The error's type.
- `message`: The error message, if available.
- `code`: A common snake-case code. Its values can be:
  - `invalid_request_error` for the `DUPLICATE_ERROR` type.
  - `api_error` for the `DB_ERROR` type.
  - `invalid_state_error` for the `CONFLICT` error type.
  - `unknown_error` for any unidentified error type.
  - For other error types, this property won't be available unless you provide a code as a third parameter to the `MedusaError` constructor.

### MedusaError Types

|Type|Description|Status Code|
|---|---|---|---|---|
|\`DB\_ERROR\`|Indicates a database error.|\`500\`|
|\`DUPLICATE\_ERROR\`|Indicates a duplicate of a record already exists. For example, when trying to create a customer whose email is registered by another customer.|\`422\`|
|\`INVALID\_ARGUMENT\`|Indicates an error that occurred due to incorrect arguments or other unexpected state.|\`500\`|
|\`INVALID\_DATA\`|Indicates a validation error.|\`400\`|
|\`UNAUTHORIZED\`|Indicates that a user is not authorized to perform an action or access a route.|\`401\`|
|\`NOT\_FOUND\`|Indicates that the requested resource, such as a route or a record, isn't found.|\`404\`|
|\`NOT\_ALLOWED\`|Indicates that an operation isn't allowed.|\`400\`|
|\`CONFLICT\`|Indicates that a request conflicts with another previous or ongoing request. The error message in this case is ignored in favor of a default message.|\`409\`|
|\`PAYMENT\_AUTHORIZATION\_ERROR\`|Indicates an error has occurred while authorizing a payment.|\`422\`|
|Other error types|Any other error type results in an |\`500\`|

***

## Override Error Handler

The `defineMiddlewares` function used to apply middlewares on routes accepts an `errorHandler` in its object parameter. Use it to override the default error handler for API routes.

This error handler will also be used for errors thrown in Medusa's API routes and resources.

For example, create `src/api/middlewares.ts` with the following:

```ts title="src/api/middlewares.ts" collapsibleLines="1-8" expandMoreLabel="Show Imports"
import { 
  defineMiddlewares, 
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export default defineMiddlewares({
  errorHandler: (
    error: MedusaError | any, 
    req: MedusaRequest, 
    res: MedusaResponse, 
    next: MedusaNextFunction
  ) => {
    res.status(400).json({
      error: "Something happened.",
    })
  },
})
```

The `errorHandler` property's value is a function that accepts four parameters:

1. The error thrown. Its type can be `MedusaError` or any other error type.
2. A request object of type `MedusaRequest`.
3. A response object of type `MedusaResponse`.
4. A function of type `MedusaNextFunction` that executes the next middleware in the stack.

This example overrides Medusa's default error handler with a handler that always returns a `400` status code with the same message.

### Re-Use Default Error Handler

In some use cases, you may not want to override the default error handler but rather perform additional actions as part of the original error handler. For example, you might want to capture the error in a third-party service like Sentry.

In those cases, you can import the default error handler from the Medusa Framework and use it in your custom error handler, along with your custom logic.

For example:

```ts title="src/api/middlewares.ts" highlights={defaultErrorHandlerHighlights} 
import { 
  defineMiddlewares, 
  errorHandler, 
  MedusaNextFunction, 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
// assuming you have Sentry set up in your project
import * as Sentry from "@sentry/node"

const originalErrorHandler = errorHandler()

export default defineMiddlewares({
  errorHandler: (
    error: MedusaError | any, 
    req: MedusaRequest, 
    res: MedusaResponse, 
    next: MedusaNextFunction
  ) => {
    // for example, capture the error in Sentry
    Sentry.captureException(error)
    return originalErrorHandler(error, req, res, next)
  },
})
```

In this example, you import the `errorHandler` function from the Medusa Framework. Then, you call it to get the original error handler function.

Finally, you use it in your custom error handler after performing your custom logic, such as capturing the error in Sentry.
