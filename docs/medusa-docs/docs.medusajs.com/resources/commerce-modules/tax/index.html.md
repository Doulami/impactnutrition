# Tax Module

In this section of the documentation, you will find resources to learn more about the Tax Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/settings/tax-regions) to learn how to manage tax regions using the dashboard.

Medusa has tax related features available out-of-the-box through the Tax Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Tax Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Tax Features

- [Tax Settings Per Region](https://docs.medusajs.com/commerce-modules/tax/tax-region): Set different tax settings for each tax region.
- [Tax Rates and Rules](https://docs.medusajs.com/commerce-modules/tax/tax-rates-and-rules): Manage each region's default tax rates and override them with conditioned tax rates.
- [Retrieve Tax Lines for carts and orders](https://docs.medusajs.com/commerce-modules/tax/tax-calculation-with-provider): Calculate and retrieve the tax lines of a cart or order's line items and shipping methods with tax providers.
- [Custom Tax Providers](https://docs.medusajs.com/commerce-modules/tax/tax-provider): Create custom tax providers to calculate tax lines differently for each tax region.

***

## How to Use Tax Module's Service

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-tax-region.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createTaxRegionStep = createStep(
  "create-tax-region",
  async ({}, { container }) => {
    const taxModuleService = container.resolve(Modules.TAX)

    const taxRegion = await taxModuleService.createTaxRegions({
      country_code: "us",
    })

    return new StepResponse({ taxRegion }, taxRegion.id)
  },
  async (taxRegionId, { container }) => {
    if (!taxRegionId) {
      return
    }
    const taxModuleService = container.resolve(Modules.TAX)

    await taxModuleService.deleteTaxRegions([taxRegionId])
  }
)

export const createTaxRegionWorkflow = createWorkflow(
  "create-tax-region",
  () => {
    const { taxRegion } = createTaxRegionStep()

    return new WorkflowResponse({ taxRegion })
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
import { createTaxRegionWorkflow } from "../../workflows/create-tax-region"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createTaxRegionWorkflow(req.scope)
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
import { createTaxRegionWorkflow } from "../workflows/create-tax-region"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createTaxRegionWorkflow(container)
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
import { createTaxRegionWorkflow } from "../workflows/create-tax-region"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createTaxRegionWorkflow(container)
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

## Configure Tax Module

The Tax Module accepts options for further configurations. Refer to [this documentation](https://docs.medusajs.com/commerce-modules/tax/module-options) for details on the module's options.

***
