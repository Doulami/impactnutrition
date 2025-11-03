# Inventory Module

In this section of the documentation, you will find resources to learn more about the Inventory Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/inventory) to learn how to manage inventory and related features using the dashboard.

Medusa has inventory related features available out-of-the-box through the Inventory Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Inventory Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Inventory Features

- [Inventory Items Management](https://docs.medusajs.com/commerce-modules/inventory/concepts): Store and manage inventory of any stock-kept item, such as product variants.
- [Inventory Across Locations](https://docs.medusajs.com/commerce-modules/inventory/concepts#inventorylevel): Manage inventory levels across different locations, such as warehouses.
- [Reservation Management](https://docs.medusajs.com/commerce-modules/inventory/concepts#reservationitem): Reserve quantities of inventory items at specific locations for orders or other purposes.
- [Check Inventory Availability](https://docs.medusajs.com/references/inventory-next/confirmInventory): Check whether an inventory item has the necessary quantity for purchase.
- [Inventory Kits](https://docs.medusajs.com/commerce-modules/inventory/inventory-kit): Create and manage inventory kits for a single product, allowing you to implement use cases like bundled or multi-part products.

***

## How to Use the Inventory Module

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/create-inventory-item.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const createInventoryItemStep = createStep(
  "create-inventory-item",
  async ({}, { container }) => {
    const inventoryModuleService = container.resolve(Modules.INVENTORY)

    const inventoryItem = await inventoryModuleService.createInventoryItems({
      sku: "SHIRT",
      title: "Green Medusa Shirt",
      requires_shipping: true,
    })

    return new StepResponse({ inventoryItem }, inventoryItem.id)
  },
  async (inventoryItemId, { container }) => {
    if (!inventoryItemId) {
      return
    }
    const inventoryModuleService = container.resolve(Modules.INVENTORY)

    await inventoryModuleService.deleteInventoryItems([inventoryItemId])
  }
)

export const createInventoryItemWorkflow = createWorkflow(
  "create-inventory-item-workflow",
  () => {
    const { inventoryItem } = createInventoryItemStep()

    return new WorkflowResponse({
      inventoryItem,
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
import { createInventoryItemWorkflow } from "../../workflows/create-inventory-item"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createInventoryItemWorkflow(req.scope)
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
import { createInventoryItemWorkflow } from "../workflows/create-inventory-item"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createInventoryItemWorkflow(container)
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
import { createInventoryItemWorkflow } from "../workflows/create-inventory-item"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createInventoryItemWorkflow(container)
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
