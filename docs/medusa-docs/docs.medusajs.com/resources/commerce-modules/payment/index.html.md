# Payment Module

In this section of the documentation, you will find resources to learn more about the Payment Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/orders/payments) to learn how to manage order payments using the dashboard.

Medusa has payment related features available out-of-the-box through the Payment Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Payment Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Payment Features

- [Authorize, Capture, and Refund Payments](https://docs.medusajs.com/commerce-modules/payment/payment): Authorize, capture, and refund payments for a single resource.
- [Payment Collection Management](https://docs.medusajs.com/commerce-modules/payment/payment-collection): Store and manage all payments of a single resources, such as a cart, in payment collections.
- [Integrate Third-Party Payment Providers](https://docs.medusajs.com/commerce-modules/payment/payment-provider): Use payment providers like [Stripe](https://docs.medusajs.com/commerce-modules/payment/payment-provider/stripe) to handle and process payments, or integrate custom payment providers.
- [Saved Payment Methods](https://docs.medusajs.com/commerce-modules/payment/account-holder): Save payment methods for customers in third-party payment providers.
- [Handle Webhook Events](https://docs.medusajs.com/commerce-modules/payment/webhook-events): Handle webhook events from third-party providers and process the associated payment.

***

## How to Use the Payment Module

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-payment-collection.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createPaymentCollectionStep = createStep(
  "create-payment-collection",
  async ({}, { container }) => {
    const paymentModuleService = container.resolve(Modules.PAYMENT)

    const paymentCollection = await paymentModuleService.createPaymentCollections({
      currency_code: "usd",
      amount: 5000,
    })

    return new StepResponse({ paymentCollection }, paymentCollection.id)
  },
  async (paymentCollectionId, { container }) => {
    if (!paymentCollectionId) {
      return
    }
    const paymentModuleService = container.resolve(Modules.PAYMENT)

    await paymentModuleService.deletePaymentCollections([paymentCollectionId])
  }
)

export const createPaymentCollectionWorkflow = createWorkflow(
  "create-payment-collection",
  () => {
    const { paymentCollection } = createPaymentCollectionStep()

    return new WorkflowResponse({
      paymentCollection,
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
import { createPaymentCollectionWorkflow } from "../../workflows/create-payment-collection"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createPaymentCollectionWorkflow(req.scope)
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
import { createPaymentCollectionWorkflow } from "../workflows/create-payment-collection"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createPaymentCollectionWorkflow(container)
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
import { createPaymentCollectionWorkflow } from "../workflows/create-payment-collection"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createPaymentCollectionWorkflow(container)
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

## Configure Payment Module

The Payment Module accepts options for further configurations. Refer to [this documentation](https://docs.medusajs.com/commerce-modules/payment/module-options) for details on the module's options.

***

## Providers

Medusa provides the following payment providers out-of-the-box. You can use them to process payments for orders, returns, and other resources.

***
