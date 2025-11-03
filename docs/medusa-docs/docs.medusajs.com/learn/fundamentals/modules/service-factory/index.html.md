# Service Factory

In this chapter, you’ll learn about what the service factory is and how to use it.

## What is the Service Factory?

Medusa provides a service factory that your module’s main service can extend.

The service factory generates data management methods for your data models, saving you time on implementing these methods manually.

Your service provides data-management functionality for your data models.

***

## How to Extend the Service Factory?

Medusa provides the service factory as a `MedusaService` function your service extends. The function creates and returns a service class with generated data-management methods.

For example, create the file `src/modules/blog/service.ts` with the following content:

```ts title="src/modules/blog/service.ts" highlights={highlights}
import { MedusaService } from "@medusajs/framework/utils"
import Post from "./models/post"

class BlogModuleService extends MedusaService({
  Post,
}){
  // TODO implement custom methods
}

export default BlogModuleService
```

### MedusaService Parameters

The `MedusaService` function accepts one parameter, which is an object of data models for which to generate data-management methods.

In the example above, since the `BlogModuleService` extends `MedusaService`, it has methods to manage the `Post` data model, such as `createPosts`.

### Generated Methods

The service factory generates methods to manage the records of each of the data models provided in the first parameter in the database.

The method names are the operation name, suffixed by the data model's key in the object parameter passed to `MedusaService`.

For example, the following methods are generated for the service above:

Find a complete reference of each of the methods in [this documentation](https://docs.medusajs.com/resources/service-factory-reference)

### listPosts

### listPosts

This method retrieves an array of records based on filters and pagination configurations.

For example:

```ts
const posts = await blogModuleService
  .listPosts()

// with filters
const posts = await blogModuleService
  .listPosts({
    id: ["123"]
  })
```

### listAndCountPosts

### retrievePost

This method retrieves a record by its ID.

For example:

```ts
const post = await blogModuleService
  .retrievePost("123")
```

### retrievePost

### updatePosts

This method updates and retrieves records of the data model.

For example:

```ts
const post = await blogModuleService
  .updatePosts({
    id: "123",
    title: "test"
  })

// update multiple
const posts = await blogModuleService
  .updatePosts([
    {
      id: "123",
      title: "test"
    },
    {
      id: "321",
      title: "test 2"
    },
  ])

// use filters
const posts = await blogModuleService
  .updatePosts([
    {
      selector: {
        id: ["123", "321"]
      },
      data: {
        title: "test"
      }
    },
  ])
```

### createPosts

### softDeletePosts

This method soft-deletes records using an array of IDs or an object of filters.

For example:

```ts
await blogModuleService.softDeletePosts("123")

// soft-delete multiple
await blogModuleService.softDeletePosts([
  "123", "321"
])

// use filters
await blogModuleService.softDeletePosts({
  id: ["123", "321"]
})
```

### updatePosts

### deletePosts

### softDeletePosts

### restorePosts

### Using a Constructor

If you implement a `constructor` in your service, make sure to call `super` and pass it `...arguments`.

For example:

```ts highlights={[["8"]]}
import { MedusaService } from "@medusajs/framework/utils"
import Post from "./models/post"

class BlogModuleService extends MedusaService({
  Post,
}){
  constructor() {
    super(...arguments)
  }
}

export default BlogModuleService
```

***

## Generated Internal Services

The service factory also generates internal services for each data model passed to the `MedusaService` function. These services are registered in the module's container and can be resolved using their camel-cased names.

For example, if the `BlogModuleService` is defined as follows:

```ts
import { MedusaService } from "@medusajs/framework/utils"
import Post from "./models/post"

class BlogModuleService extends MedusaService({
  Post,
}){
}

export default BlogModuleService
```

Then, you'll have a `postService` registered in the module's container that allows you to manage posts.

Generated internal services have the same methods as the `BlogModuleService`, such as `create`, `retrieve`, `update`, and `delete`, but without the data model name suffix.

These services are useful when you need to perform database operations in loaders, as they are executed before the module's services are registered. Learn more in the [Module Container](https://docs.medusajs.com/learn/fundamentals/modules/container) documentation.

For example, you can create a loader that logs the number of posts in the database:

```ts
import { LoaderOptions } from "@medusajs/framework/types"

export default async function helloWorldLoader({
  container,
}: LoaderOptions) {
  const postService = container.resolve("postService")

  const [_, count] = await postService.listAndCount()

  console.log(`[helloWorldLoader]: There are ${count} posts in the database.`)
}
```
