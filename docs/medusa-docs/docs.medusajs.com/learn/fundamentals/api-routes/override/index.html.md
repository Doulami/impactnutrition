# Override API Routes

In this chapter, you'll learn the approach recommended when you need to override an existing API route in Medusa.

## Approaches to Consider Before Overriding API Routes

While building customizations in your Medusa application, you may need to make changes to existing API routes for your business use case.

Medusa provides the following approaches to customize API routes:

|Approach|Description|
|---|---|
|Pass Additional Data|Pass custom data to the API route with custom validation.|
|Perform Custom Logic within an Existing Flows|API routes execute workflows to perform business logic, which may have hooks that allow you to perform custom logic.|
|Use Custom Middlewares|Use custom middlewares to perform custom logic before the API route is executed. However, you cannot remove or replace middlewares applied to existing API routes.|
|Listen to Events in Subscribers|Functionalities in API routes may trigger events that you can handle in subscribers. This is useful if you're performing an action that isn't integral to the API route's core functionality or response.|

If the above approaches do not meet your needs, you can consider the approaches mentioned in the rest of this chapter.

***

## Replicate, Don't Override API Routes

If the approaches mentioned in the [section above](#approaches-to-consider-before-overriding-api-routes) do not meet your needs, you can replicate an existing API route and modify it to suit your requirements.

By replicating instead of overriding, the original API route remains intact, allowing you to easily revert to the original functionality if needed. You can also update your Medusa version without worrying about breaking changes in the original API route.

***

## How to Replicate an API Route?

Medusa's API routes are generally slim and use logic contained in [workflows](https://docs.medusajs.com/learn/fundamentals/workflows). So, creating a custom route based on the original route is straightforward.

You can view the source code for Medusa's API routes in the [Medusa GitHub repository](https://github.com/medusajs/medusa/tree/develop/packages/medusa/src/api).

For example, if you need to allow vendors to access the `POST /admin/products` API route, you can create an API route in your Medusa project at `src/api/vendor/products/route.ts` with the [same code as the original route](https://github.com/medusajs/medusa/blob/develop/packages/medusa/src/api/admin/products/route.ts#L88). Then, you can make changes to it or its middlewares.

***

## When to Replicate an API Route?

Some examples of when you might want to replicate an API route include:

|Use Case|Description|
|---|---|
|Custom Validation|You want to change the validation logic for a specific API route, and the |
|Change Authentication|You want to remove required authentication for a specific API route, or you want to allow custom |
|Custom Response|You want to change the response format of an existing API route.|
|Override Middleware|You want to override the middleware applied on existing API routes. Because of |
