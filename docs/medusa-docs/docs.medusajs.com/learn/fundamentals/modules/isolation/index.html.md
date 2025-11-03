# Module Isolation

In this chapter, you'll learn how modules are isolated, and what that means for your custom development.

- Modules can't access resources, such as services or data models, from other modules.
- Use [Module Links](https://docs.medusajs.com/learn/fundamentals/module-links) to extend an existing module's data models, and [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query) to retrieve data across modules.
- Use [workflows](https://docs.medusajs.com/learn/fundamentals/workflows) to build features that depend on functionalities from different modules.

## How are Modules Isolated?

A module is unaware of any resources other than its own, such as services or data models. This means it can't access these resources if they're implemented in another module.

For example, your custom module can't resolve the Product Module's main service or have direct relationships from its data model to the Product Module's data models.

A module has its own container, as explained in the [Module Container](https://docs.medusajs.com/learn/fundamentals/modules/container) chapter. This container includes the module's resources, such as services and data models, and some Framework resources that the Medusa application provides.

Refer to the [Module Container Resources](https://docs.medusajs.com/resources/medusa-container-resources) for a list of resources registered in a module's container.

***

## Why are Modules Isolated

Some of the module isolation's benefits include:

- Integrate your module into any Medusa application without side-effects to your setup.
- Replace existing modules with your custom implementation if your use case is drastically different.
- Use modules in other environments, such as Edge functions and Next.js apps.

***

## How to Extend Data Model of Another Module?

To extend the data model of another module, such as the `Product` data model of the Product Module, use [Module Links](https://docs.medusajs.com/learn/fundamentals/module-links). Module Links allow you to build associations between data models of different modules without breaking the module isolation.

Then, you can retrieve data across modules using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query).

***

## How to Use Services of Other Modules?

You'll often build feature that uses functionalities from different modules. For example, if you may need to retrieve brands, then sync them to a third-party service.

To build functionalities spanning across modules and systems, create a [workflow](https://docs.medusajs.com/learn/fundamentals/workflows) whose steps resolve the modules' services to perform these functionalities.

Workflows ensure data consistency through their roll-back mechanism and tracking of each execution's status, steps, input, and output.

### Example

For example, consider you have two modules:

1. A module that stores and manages brands in your application.
2. A module that integrates a third-party Content Management System (CMS).

To sync brands from your application to the third-party system, create the following steps:

```ts title="Example Steps" highlights={stepsHighlights}
const retrieveBrandsStep = createStep(
  "retrieve-brands",
  async (_, { container }) => {
    const brandModuleService = container.resolve(
      "brand"
    )

    const brands = await brandModuleService.listBrands()

    return new StepResponse(brands)
  }
)

const createBrandsInCmsStep = createStep(
  "create-brands-in-cms",
  async ({ brands }, { container }) => {
    const cmsModuleService = container.resolve(
      "cms"
    )

    const cmsBrands = await cmsModuleService.createBrands(brands)

    return new StepResponse(cmsBrands, cmsBrands)
  },
  async (brands, { container }) => {
    const cmsModuleService = container.resolve(
      "cms"
    )

    await cmsModuleService.deleteBrands(
      brands.map((brand) => brand.id)
    )
  }
)
```

The `retrieveBrandsStep` retrieves the brands from a Brand Module, and the `createBrandsInCmsStep` creates the brands in a third-party system using a CMS Module.

Then, create the following workflow that uses these steps:

```ts title="Example Workflow"
export const syncBrandsWorkflow = createWorkflow(
  "sync-brands",
  () => {
    const brands = retrieveBrandsStep()

    createBrandsInCmsStep({ brands })
  }
)
```

You can then use this workflow in an API route, scheduled job, or other resources that use this functionality.

***

## How to Use Framework APIs and Tools in Module?

### Framework Tools in Module Container

A module has in its container some Framework APIs and tools, such as [Logger](https://docs.medusajs.com/learn/debugging-and-testing/logging). You can refer to the [Module Container Resources](https://docs.medusajs.com/resources/medusa-container-resources) for a list of resources registered in a module's container.

You can resolve those resources in the module's services and loaders.

For example:

```ts title="Example Service"
import { Logger } from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

export default class BlogModuleService {
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies) {
    this.logger_ = logger

    this.logger_.info("[BlogModuleService]: Hello World!")
  }

  // ...
}
```

In this example, the `BlogModuleService` class resolves the `Logger` service from the module's container and uses it to log a message.

### Using Framework Tools in Workflows

Some Framework APIs and tools are not registered in the module's container. For example, [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query) is only registered in the Medusa container.

You should, instead, build workflows that use these APIs and tools along with your module's service.

For example, you can create a workflow that retrieves data using Query, then pass the data to your module's service to perform some action.

```ts title="Example Workflow"
import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

const createBrandsInCmsStep = createStep(
  "create-brands-in-cms",
  async ({ brands }, { container }) => {
    const cmsModuleService = container.resolve(
      "cms"
    )

    const cmsBrands = await cmsModuleService.createBrands(brands)

    return new StepResponse(cmsBrands, cmsBrands)
  },
  async (brands, { container }) => {
    const cmsModuleService = container.resolve(
      "cms"
    )

    await cmsModuleService.deleteBrands(
      brands.map((brand) => brand.id)
    )
  }
)

const syncBrandsWorkflow = createWorkflow(
  "sync-brands",
  () => {
    const { data: brands } = useQueryGraphStep({
      entity: "brand",
      fields: [
        "*",
        "products.*",
      ],
    })

    createBrandsInCmsStep({ brands })
  }
)
```

In this example, you use the `useQueryGraphStep` to retrieve brands with their products, then pass the brands to the `createBrandsInCmsStep` step.

In the `createBrandsInCmsStep`, you resolve the CMS Module's service from the module's container and use it to create the brands in the third-party system. You pass the brands you retrieved using Query to the module's service.

### Injecting Dependencies to Module

Some cases still require you to access external resources, mainly [Infrastructure Modules](https://docs.medusajs.com/resources/infrastructure-modules) or Framework tools, in your module.
For example, you may need the [Event Module](https://docs.medusajs.com/resources/infrastructure-modules/event) to emit events from your module's service.

In those cases, you can inject the dependencies to your module's service in `medusa-config.ts` using the `dependencies` property of the module's configuration.

Use this approach only when absolutely necessary, where workflows aren't sufficient for your use case. By injecting dependencies, you risk breaking your module if the dependency isn't provided, or if the dependency's API changes.

For example:

```ts title="medusa-config.ts"
import { Modules } from "@medusajs/framework/utils"

module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "./src/modules/blog",
      dependencies: [
        Modules.EVENT_BUS,
      ],
    },
  ],
})
```

In this example, you inject the Event Module's service to your module's container.

Only the main service will be injected into the module's container.

You can then use the Event Module's service in your module's service:

```ts title="Example Service"
class BlogModuleService {
  protected eventBusService_: AbstractEventBusModuleService

  constructor({ event_bus }) {
    this.eventBusService_ = event_bus
  }

  performAction() {
    // TODO perform action

    this.eventBusService_.emit({
      name: "custom.event",
      data: {
        id: "123",
        // other data payload
      },
    })
  }
}
```
