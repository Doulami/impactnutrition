# Event Data Payload

In this chapter, you'll learn how subscribers receive an event's data payload.

## Access Event's Data Payload

When events are emitted, they’re emitted with a data payload.

The object that the subscriber function receives as a parameter has an `event` property, which is an object holding the event payload in a `data` property with additional context.

For example:

```ts title="src/subscribers/product-created.ts" highlights={highlights} collapsibleLines="1-5" expandButtonLabel="Show Imports"
import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

export default async function productCreateHandler({
  event,
}: SubscriberArgs<{ id: string }>) {
  const productId = event.data.id
  console.log(`The product ${productId} was created`)
}

export const config: SubscriberConfig = {
  event: "product.created",
}
```

The `event` object has the following properties:

- data: (\`object\`) The data payload of the event. Its properties are different for each event.
- name: (string) The name of the triggered event.
- metadata: (\`object\`) Additional data and context of the emitted event.

This logs the product ID received in the `product.created` event’s data payload to the console.

{/* ---

## List of Events with Data Payload

Refer to [this reference](!resources!/references/events) for a full list of events emitted by Medusa and their data payloads. */}
