# User Module

In this section of the documentation, you will find resources to learn more about the User Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/settings/users) to learn how to manage users using the dashboard.

Medusa has user related features available out-of-the-box through the User Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this User Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## User Features

- [User Management](https://docs.medusajs.com/commerce-modules/user/user-creation-flows): Store and manage users in your store.
- [Invite Users](https://docs.medusajs.com/commerce-modules/user/user-creation-flows#invite-users): Invite users to join your store and manage those invites.

***

## How to Use User Module's Service

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-user.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createUserStep = createStep(
  "create-user",
  async ({}, { container }) => {
    const userModuleService = container.resolve(Modules.USER)

    const user = await userModuleService.createUsers({
      email: "user@example.com",
      first_name: "John",
      last_name: "Smith",
    })

    return new StepResponse({ user }, user.id)
  },
  async (userId, { container }) => {
    if (!userId) {
      return
    }
    const userModuleService = container.resolve(Modules.USER)

    await userModuleService.deleteUsers([userId])
  }
)

export const createUserWorkflow = createWorkflow(
  "create-user",
  () => {
    const { user } = createUserStep()

    return new WorkflowResponse({
      user,
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
import { createUserWorkflow } from "../../workflows/create-user"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createUserWorkflow(req.scope)
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
import { createUserWorkflow } from "../workflows/create-user"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createUserWorkflow(container)
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
import { createUserWorkflow } from "../workflows/create-user"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createUserWorkflow(container)
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

## Configure User Module

The User Module accepts options for further configurations. Refer to [this documentation](https://docs.medusajs.com/commerce-modules/user/module-options) for details on the module's options.

***
