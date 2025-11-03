# Order Module

In this section of the documentation, you will find resources to learn more about the Order Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/orders) to learn how to manage orders using the dashboard.

Medusa has order related features available out-of-the-box through the Order Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Order Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Order Features

- [Order Management](https://docs.medusajs.com/commerce-modules/order/concepts): Store and manage your orders to retrieve, create, cancel, and perform other operations.
- [Draft Orders](https://docs.medusajs.com/commerce-modules/order/draft-orders): Allow merchants to create orders on behalf of their customers as draft orders that later are transformed to regular orders.
- [Apply Promotion Adjustments](https://docs.medusajs.com/commerce-modules/order/promotion-adjustments): Apply promotions or discounts to the order's items and shipping methods by adding adjustment lines that are factored into their subtotals.
- [Apply Tax Lines](https://docs.medusajs.com/commerce-modules/order/tax-lines): Apply tax lines to an order's line items and shipping methods.
- [Returns](https://docs.medusajs.com/commerce-modules/order/return), [Edits](https://docs.medusajs.com/commerce-modules/order/edit), [Exchanges](https://docs.medusajs.com/commerce-modules/order/exchange), and [Claims](https://docs.medusajs.com/commerce-modules/order/claim): Make [changes](https://docs.medusajs.com/commerce-modules/order/order-change) to an order to edit, return, or exchange its items, with [version-based control](https://docs.medusajs.com/commerce-modules/order/order-versioning) over the order's timeline.

***

## How to Use the Order Module

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-draft-order.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createDraftOrderStep = createStep(
  "create-order",
  async ({}, { container }) => {
    const orderModuleService = container.resolve(Modules.ORDER)

    const draftOrder = await orderModuleService.createOrders({
      currency_code: "usd",
      items: [
        {
          title: "Shirt",
          quantity: 1,
          unit_price: 3000,
        },
      ],
      shipping_methods: [
        {
          name: "Express shipping",
          amount: 3000,
        },
      ],
      status: "draft",
    })

    return new StepResponse({ draftOrder }, draftOrder.id)
  },
  async (draftOrderId, { container }) => {
    if (!draftOrderId) {
      return
    }
    const orderModuleService = container.resolve(Modules.ORDER)

    await orderModuleService.deleteOrders([draftOrderId])
  }
)

export const createDraftOrderWorkflow = createWorkflow(
  "create-draft-order",
  () => {
    const { draftOrder } = createDraftOrderStep()

    return new WorkflowResponse({
      draftOrder,
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
import { createDraftOrderWorkflow } from "../../workflows/create-draft-order"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createDraftOrderWorkflow(req.scope)
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
import { createDraftOrderWorkflow } from "../workflows/create-draft-order"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createDraftOrderWorkflow(container)
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
import { createDraftOrderWorkflow } from "../workflows/create-draft-order"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createDraftOrderWorkflow(container)
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
