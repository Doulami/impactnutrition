# Region Module

In this section of the documentation, you will find resources to learn more about the Region Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/settings/regions) to learn how to manage regions using the dashboard.

Medusa has region related features available out-of-the-box through the Region Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Region Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

***

## Region Features

- [Region Management](https://docs.medusajs.com/references/region/models/Region): Manage regions in your store. You can create regions with different currencies and settings.
- [Multi-Currency Support](https://docs.medusajs.com/references/region/models/Region): Each region has a currency. You can support multiple currencies in your store by creating multiple regions.
- [Different Settings Per Region](https://docs.medusajs.com/references/region/models/Region): Each region has its own settings, such as what countries belong to a region or its tax settings.

***

## How to Use Region Module's Service

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-region.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createRegionStep = createStep(
  "create-region",
  async ({}, { container }) => {
    const regionModuleService = container.resolve(Modules.REGION)

    const region = await regionModuleService.createRegions({
      name: "Europe",
      currency_code: "eur",
    })

    return new StepResponse({ region }, region.id)
  },
  async (regionId, { container }) => {
    if (!regionId) {
      return
    }
    const regionModuleService = container.resolve(Modules.REGION)

    await regionModuleService.deleteRegions([regionId])
  }
)

export const createRegionWorkflow = createWorkflow(
  "create-region",
  () => {
    const { region } = createRegionStep()

    return new WorkflowResponse({
      region,
    })
  }
)
```

You can then execute the workflow in your custom API routes, scheduled jobs, or subscribers:

### API Route

```ts title="src/api/workflow/route.ts" highlights={[["11"], ["12"]]} collapsibleLines="1-6" expandButtonLabel="Show Imports"
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createRegionWorkflow } from "../../workflows/create-region"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createRegionWorkflow(req.scope)
    .run()

  res.send(result)
}
```

### Subscriber

```ts title="src/subscribers/user-created.ts" highlights={[["11"], ["12"]]} collapsibleLines="1-6" expandButtonLabel="Show Imports"
import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createRegionWorkflow } from "../workflows/create-region"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createRegionWorkflow(container)
    .run()

  console.log(result)
}

export const config: SubscriberConfig = {
  event: "user.created",
}
```

### Scheduled Job

```ts title="src/jobs/run-daily.ts" highlights={[["7"], ["8"]]}
import { MedusaContainer } from "@medusajs/framework/types"
import { createRegionWorkflow } from "../workflows/create-region"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createRegionWorkflow(container)
    .run()

  console.log(result)
}

export const config = {
  name: "run-once-a-day",
  schedule: `0 0 * * *`,
}
```

Learn more about workflows in [this documentation](https://docs.medusajs.com/learn/fundamentals/workflows).

***
