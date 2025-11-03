# Promotion Module

In this section of the documentation, you will find resources to learn more about the Promotion Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/promotions) to learn how to manage promotions using the dashboard.

Medusa has promotion related features available out-of-the-box through the Promotion Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Promotion Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Promotion Features

- [Discount Functionalities](https://docs.medusajs.com/commerce-modules/promotion/concepts): A promotion discounts an amount or percentage of a cart's items, shipping methods, or the entire order.
- [Flexible Promotion Rules](https://docs.medusajs.com/commerce-modules/promotion/concepts#flexible-rules): A promotion has rules that restricts when the promotion is applied.
- [Campaign Management](https://docs.medusajs.com/commerce-modules/promotion/campaign): A campaign combines promotions under the same conditions, such as start and end dates, and budget configurations.
- [Apply Promotion on Carts and Orders](https://docs.medusajs.com/commerce-modules/promotion/actions): Apply promotions on carts and orders to discount items, shipping methods, or the entire order.

***

## How to Use the Promotion Module

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-promotion.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createPromotionStep = createStep(
  "create-promotion",
  async ({}, { container }) => {
    const promotionModuleService = container.resolve(Modules.PROMOTION)

    const promotion = await promotionModuleService.createPromotions({
      code: "10%OFF",
      type: "standard",
      application_method: {
        type: "percentage",
        target_type: "order",
        value: 10,
        currency_code: "usd",
      },
    })

    return new StepResponse({ promotion }, promotion.id)
  },
  async (promotionId, { container }) => {
    if (!promotionId) {
      return
    }
    const promotionModuleService = container.resolve(Modules.PROMOTION)

    await promotionModuleService.deletePromotions(promotionId)
  }
)

export const createPromotionWorkflow = createWorkflow(
  "create-promotion",
  () => {
    const { promotion } = createPromotionStep()

    return new WorkflowResponse({
      promotion,
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
import { createPromotionWorkflow } from "../../workflows/create-cart"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createPromotionWorkflow(req.scope)
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
import { createPromotionWorkflow } from "../workflows/create-cart"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createPromotionWorkflow(container)
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
import { createPromotionWorkflow } from "../workflows/create-cart"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createPromotionWorkflow(container)
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
