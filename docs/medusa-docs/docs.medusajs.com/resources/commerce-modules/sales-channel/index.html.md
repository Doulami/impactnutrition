# Sales Channel Module

In this section of the documentation, you will find resources to learn more about the Sales Channel Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/settings/sales-channels) to learn how to manage sales channels using the dashboard.

Medusa has sales channel related features available out-of-the-box through the Sales Channel Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Sales Channel Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## What's a Sales Channel?

A sales channel indicates an online or offline channel that you sell products on.

Some use case examples for using a sales channel:

- Implement a B2B Ecommerce Store.
- Specify different products for each channel you sell in.
- Support omnichannel in your ecommerce store.

***

## Sales Channel Features

- [Sales Channel Management](https://docs.medusajs.com/references/sales-channel/models/SalesChannel): Manage sales channels in your store. Each sales channel has different meta information such as name or description, allowing you to easily differentiate between sales channels.
- [Product Availability](https://docs.medusajs.com/commerce-modules/sales-channel/links-to-other-modules): Medusa uses the Product and Sales Channel modules to allow merchants to specify a product's availability per sales channel.
- [Cart and Order Scoping](https://docs.medusajs.com/commerce-modules/sales-channel/links-to-other-modules): Carts, available through the Cart Module, are scoped to a sales channel. Paired with the product availability feature, you benefit from more features like allowing only products available in sales channel in a cart.
- [Inventory Availability Per Sales Channel](https://docs.medusajs.com/commerce-modules/sales-channel/links-to-other-modules): Medusa links sales channels to stock locations, allowing you to retrieve available inventory of products based on the specified sales channel.

***

## How to Use Sales Channel Module's Service

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-sales-channel.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createSalesChannelStep = createStep(
  "create-sales-channel",
  async ({}, { container }) => {
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

    const salesChannels = await salesChannelModuleService.createSalesChannels([
      {
        name: "B2B",
      },
      {
        name: "Mobile App",
      },
    ])

    return new StepResponse({ salesChannels }, salesChannels.map((sc) => sc.id))
  },
  async (salesChannelIds, { container }) => {
    if (!salesChannelIds) {
      return
    }
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

    await salesChannelModuleService.deleteSalesChannels(
      salesChannelIds
    )
  }
)

export const createSalesChannelWorkflow = createWorkflow(
  "create-sales-channel",
  () => {
    const { salesChannels } = createSalesChannelStep()

    return new WorkflowResponse({
      salesChannels,
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
import { createSalesChannelWorkflow } from "../../workflows/create-sales-channel"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createSalesChannelWorkflow(req.scope)
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
import { createSalesChannelWorkflow } from "../workflows/create-sales-channel"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createSalesChannelWorkflow(container)
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
import { createSalesChannelWorkflow } from "../workflows/create-sales-channel"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createSalesChannelWorkflow(container)
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
