# Currency Module

In this section of the documentation, you will find resources to learn more about the Currency Module and how to use it in your application.

Refer to the [Medusa Admin User Guide](https://docs.medusajs.com/user-guide/settings/store) to learn how to manage your store's currencies using the dashboard.

Medusa has currency related features available out-of-the-box through the Currency Module. A [module](https://docs.medusajs.com/learn/fundamentals/modules) is a standalone package that provides features for a single domain. Each of Medusa's commerce features are placed in Commerce Modules, such as this Currency Module.

Learn more about why modules are isolated in [this documentation](https://docs.medusajs.com/learn/fundamentals/modules/isolation).

## Currency Features

- [Currency Management and Retrieval](https://docs.medusajs.com/references/currency/listAndCountCurrencies): This module adds all common currencies to your application and allows you to retrieve them.
- [Support Currencies in Modules](https://docs.medusajs.com/commerce-modules/currency/links-to-other-modules): Other Commerce Modules use currency codes in their data models or operations. Use the Currency Module to retrieve a currency code and its details.

***

## How to Use the Currency Module

In your Medusa application, you build flows around Commerce Modules. A flow is built as a [Workflow](https://docs.medusajs.com/learn/fundamentals/workflows), which is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

You can build custom workflows and steps. You can also re-use Medusa's workflows and steps, which are provided by the `@medusajs/medusa/core-flows` package.

For example:

```ts title="src/workflows/retrieve-price-with-currency.ts" highlights={highlights}
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const retrieveCurrencyStep = createStep(
  "retrieve-currency",
  async ({}, { container }) => {
    const currencyModuleService = container.resolve(Modules.CURRENCY)

    const currency = await currencyModuleService
      .retrieveCurrency("usd")

    return new StepResponse({ currency })
  }
)

type Input = {
  price: number
}

export const retrievePriceWithCurrency = createWorkflow(
  "create-currency",
  (input: Input) => {
    const { currency } = retrieveCurrencyStep()

    const formattedPrice = transform({
      input,
      currency,
    }, (data) => {
      return `${data.currency.symbol}${data.input.price}`
    })

    return new WorkflowResponse({
      formattedPrice,
    })
  }
)
```

You can then execute the workflow in your custom API routes, scheduled jobs, or subscribers:

### API Route

```ts title="src/api/workflow/route.ts" highlights={[["11"], ["12"], ["13"], ["14"]]} collapsibleLines="1-6" expandButtonLabel="Show Imports"
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { retrievePriceWithCurrency } from "../../workflows/retrieve-price-with-currency"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await retrievePriceWithCurrency(req.scope)
    .run({
      price: 10,
    })

  res.send(result)
}
```

### Subscriber

```ts title="src/subscribers/user-created.ts" highlights={[["11"], ["12"], ["13"], ["14"]]} collapsibleLines="1-6" expandButtonLabel="Show Imports"
import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { retrievePriceWithCurrency } from "../workflows/retrieve-price-with-currency"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await retrievePriceWithCurrency(container)
    .run({
      price: 10,
    })

  console.log(result)
}

export const config: SubscriberConfig = {
  event: "user.created",
}
```

### Scheduled Job

```ts title="src/jobs/run-daily.ts" highlights={[["7"], ["8"], ["9"], ["10"]]}
import { MedusaContainer } from "@medusajs/framework/types"
import { retrievePriceWithCurrency } from "../workflows/retrieve-price-with-currency"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await retrievePriceWithCurrency(container)
    .run({
      price: 10,
    })

  console.log(result)
}

export const config = {
  name: "run-once-a-day",
  schedule: `0 0 * * *`,
}
```

Learn more about workflows in [this documentation](https://docs.medusajs.com/learn/fundamentals/workflows).

***
