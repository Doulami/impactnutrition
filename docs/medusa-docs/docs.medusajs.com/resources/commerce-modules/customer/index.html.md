# Customer Module

In this section of the documentation, you will find resources to learn more about the Customer Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/customers) to learn how to manage customers and groups using the dashboard.

Medusa has customer related features available out-of-the-box through the Customer Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Customer Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Customer Features

- [Customer Management](https://docs.medusajs.com/commerce-modules/customer/customer-accounts): Store and manage guest and registered customers in your store.
- [Customer Organization](https://docs.medusajs.com/references/customer/models): Organize customers into groups. This has a lot of benefits and supports many use cases, such as provide discounts for specific customer groups using the [Promotion Module](https://docs.medusajs.com/commerce-modules/promotion).

***

## How to Use the Customer Module

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-customer.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createCustomerStep = createStep(
  "create-customer",
  async ({}, { container }) => {
    const customerModuleService = container.resolve(Modules.CUSTOMER)

    const customer = await customerModuleService.createCustomers({
      first_name: "Peter",
      last_name: "Hayes",
      email: "peter.hayes@example.com",
    })

    return new StepResponse({ customer }, customer.id)
  },
  async (customerId, { container }) => {
    if (!customerId) {
      return
    }
    const customerModuleService = container.resolve(Modules.CUSTOMER)

    await customerModuleService.deleteCustomers([customerId])
  }
)

export const createCustomerWorkflow = createWorkflow(
  "create-customer",
  () => {
    const { customer } = createCustomerStep()

    return new WorkflowResponse({
      customer,
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
import { createCustomerWorkflow } from "../../workflows/create-customer"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createCustomerWorkflow(req.scope)
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
import { createCustomerWorkflow } from "../workflows/create-customer"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createCustomerWorkflow(container)
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
import { createCustomerWorkflow } from "../workflows/create-customer"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createCustomerWorkflow(container)
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
