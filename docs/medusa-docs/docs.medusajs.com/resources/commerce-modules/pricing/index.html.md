# Pricing Module

In this section of the documentation, you will find resources to learn more about the Pricing Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/price-lists) to learn how to manage price lists using the dashboard.

Medusa has pricing related features available out-of-the-box through the Pricing Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Pricing Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Pricing Features

- [Price Management](https://docs.medusajs.com/commerce-modules/pricing/concepts): Store and manage prices of a resource, such as a product or a variant.
- [Multi-Currency and Region Support](https://docs.medusajs.com/commerce-modules/pricing/concepts#multi-currency-support-for-prices): Define prices for a single resource in multiple currencies and regions.
- [Advanced Rule Engine](https://docs.medusajs.com/commerce-modules/pricing/price-rules): Create prices with tiers and custom rules to condition prices based on different contexts.
- [Price Lists](https://docs.medusajs.com/commerce-modules/pricing/concepts#price-list): Group prices and apply them only in specific conditions with price lists.
- [Price Calculation Strategy](https://docs.medusajs.com/commerce-modules/pricing/price-calculation): Retrieve the best price in a given context and for the specified rule values.
- [Tax-Inclusive Pricing](https://docs.medusajs.com/commerce-modules/pricing/tax-inclusive-pricing): Calculate prices with taxes included in the price, and Medusa will handle calculating the taxes automatically.

***

## How to Use the Pricing Module

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-price-set.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createPriceSetStep = createStep(
  "create-price-set",
  async ({}, { container }) => {
    const pricingModuleService = container.resolve(Modules.PRICING)

    const priceSet = await pricingModuleService.createPriceSets({
      prices: [
        {
          amount: 500,
          currency_code: "USD",
        },
        {
          amount: 400,
          currency_code: "EUR",
          min_quantity: 0,
          max_quantity: 4,
          rules: {},
        },
      ],
    })

    return new StepResponse({ priceSet }, priceSet.id)
  },
  async (priceSetId, { container }) => {
    if (!priceSetId) {
      return
    }
    const pricingModuleService = container.resolve(Modules.PRICING)

    await pricingModuleService.deletePriceSets([priceSetId])
  }
)

export const createPriceSetWorkflow = createWorkflow(
  "create-price-set",
  () => {
    const { priceSet } = createPriceSetStep()

    return new WorkflowResponse({
      priceSet,
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
import { createPriceSetWorkflow } from "../../workflows/create-price-set"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createPriceSetWorkflow(req.scope)
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
import { createPriceSetWorkflow } from "../workflows/create-price-set"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createPriceSetWorkflow(container)
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
import { createPriceSetWorkflow } from "../workflows/create-price-set"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createPriceSetWorkflow(container)
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
