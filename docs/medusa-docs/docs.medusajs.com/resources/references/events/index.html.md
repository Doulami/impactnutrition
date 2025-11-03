# Events Reference

This documentation page includes the list of all events emitted by [Medusa's workflows](https://docs.medusajs.com/resources/medusa-workflows-reference).

## Auth Events

### Summary

|Event|Description|
|---|---|
|auth.password\_reset|Emitted when a reset password token is generated. You can listen to this event
to send a reset password email to the user or customer, for example.|

### auth.password\_reset

Emitted when a reset password token is generated. You can listen to this event
to send a reset password email to the user or customer, for example.

#### Payload

```ts
{
  entity_id, // The identifier of the user or customer. For example, an email address.
  actor_type, // The type of actor. For example, "customer", "user", or custom.
  token, // The generated token.
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [generateResetPasswordTokenWorkflow](https://docs.medusajs.com/references/medusa-workflows/generateResetPasswordTokenWorkflow)

***

## Cart Events

### Summary

|Event|Description|
|---|---|
|cart.created|Emitted when a cart is created.|
|cart.updated|Emitted when a cart's details are updated.|
|cart.region\_updated|Emitted when the cart's region is updated. This
event is emitted alongside the |
|cart.customer\_transferred|Emitted when the customer in the cart is transferred.|

### cart.created

Emitted when a cart is created.

#### Payload

```ts
{
  id, // The ID of the cart
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createCartWorkflow](https://docs.medusajs.com/references/medusa-workflows/createCartWorkflow)

***

### cart.updated

Emitted when a cart's details are updated.

#### Payload

```ts
{
  id, // The ID of the cart
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateLineItemInCartWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateLineItemInCartWorkflow)
- [updateCartWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateCartWorkflow)
- [addToCartWorkflow](https://docs.medusajs.com/references/medusa-workflows/addToCartWorkflow)
- [addShippingMethodToCartWorkflow](https://docs.medusajs.com/references/medusa-workflows/addShippingMethodToCartWorkflow)

***

### cart.region\_updated

Emitted when the cart's region is updated. This
event is emitted alongside the `cart.updated` event.

#### Payload

```ts
{
  id, // The ID of the cart
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateCartWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateCartWorkflow)

***

### cart.customer\_transferred&#xA;

Emitted when the customer in the cart is transferred.

#### Payload

```ts
{
  id, // The ID of the cart
  customer_id, // The ID of the customer
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [transferCartCustomerWorkflow](https://docs.medusajs.com/references/medusa-workflows/transferCartCustomerWorkflow)

***

## Customer Events

### Summary

|Event|Description|
|---|---|
|customer.created|Emitted when a customer is created.|
|customer.updated|Emitted when a customer is updated.|
|customer.deleted|Emitted when a customer is deleted.|

### customer.created

Emitted when a customer is created.

#### Payload

```ts
[{
  id, // The ID of the customer
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createCustomersWorkflow](https://docs.medusajs.com/references/medusa-workflows/createCustomersWorkflow)
- [createCustomerAccountWorkflow](https://docs.medusajs.com/references/medusa-workflows/createCustomerAccountWorkflow)

***

### customer.updated

Emitted when a customer is updated.

#### Payload

```ts
[{
  id, // The ID of the customer
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateCustomersWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateCustomersWorkflow)

***

### customer.deleted

Emitted when a customer is deleted.

#### Payload

```ts
[{
  id, // The ID of the customer
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteCustomersWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteCustomersWorkflow)
- [removeCustomerAccountWorkflow](https://docs.medusajs.com/references/medusa-workflows/removeCustomerAccountWorkflow)

***

## Fulfillment Events

### Summary

|Event|Description|
|---|---|
|shipment.created|Emitted when a shipment is created for an order.|
|delivery.created|Emitted when a fulfillment is marked as delivered.|

### shipment.created

Emitted when a shipment is created for an order.

#### Payload

```ts
{
  id, // the ID of the fulfillment
  no_notification, // (boolean) whether to notify the customer
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createOrderShipmentWorkflow](https://docs.medusajs.com/references/medusa-workflows/createOrderShipmentWorkflow)

***

### delivery.created

Emitted when a fulfillment is marked as delivered.

#### Payload

```ts
{
  id, // the ID of the fulfillment
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [markOrderFulfillmentAsDeliveredWorkflow](https://docs.medusajs.com/references/medusa-workflows/markOrderFulfillmentAsDeliveredWorkflow)

***

## Invite Events

### Summary

|Event|Description|
|---|---|
|invite.accepted|Emitted when an invite is accepted.|
|invite.created|Emitted when invites are created. You can listen to this event
to send an email to the invited users, for example.|
|invite.deleted|Emitted when invites are deleted.|
|invite.resent|Emitted when invites should be resent because their token was
refreshed. You can listen to this event to send an email to the invited users,
for example.|

### invite.accepted

Emitted when an invite is accepted.

#### Payload

```ts
{
  id, // The ID of the invite
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [acceptInviteWorkflow](https://docs.medusajs.com/references/medusa-workflows/acceptInviteWorkflow)

***

### invite.created

Emitted when invites are created. You can listen to this event
to send an email to the invited users, for example.

#### Payload

```ts
[{
  id, // The ID of the invite
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createInvitesWorkflow](https://docs.medusajs.com/references/medusa-workflows/createInvitesWorkflow)

***

### invite.deleted

Emitted when invites are deleted.

#### Payload

```ts
[{
  id, // The ID of the invite
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteInvitesWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteInvitesWorkflow)

***

### invite.resent

Emitted when invites should be resent because their token was
refreshed. You can listen to this event to send an email to the invited users,
for example.

#### Payload

```ts
[{
  id, // The ID of the invite
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [refreshInviteTokensWorkflow](https://docs.medusajs.com/references/medusa-workflows/refreshInviteTokensWorkflow)

***

## Order Edit Events

### Summary

|Event|Description|
|---|---|
|order-edit.requested|Emitted when an order edit is requested.|
|order-edit.confirmed|Emitted when an order edit request is confirmed.|
|order-edit.canceled|Emitted when an order edit request is canceled.|

### order-edit.requested&#xA;

Emitted when an order edit is requested.

#### Payload

```ts
{
  order_id, // The ID of the order
  actions, // (array) The [actions](https://docs.medusajs.com/resources/references/fulfillment/interfaces/fulfillment.OrderChangeActionDTO) to edit the order
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [requestOrderEditRequestWorkflow](https://docs.medusajs.com/references/medusa-workflows/requestOrderEditRequestWorkflow)

***

### order-edit.confirmed&#xA;

Emitted when an order edit request is confirmed.

#### Payload

```ts
{
  order_id, // The ID of the order
  actions, // (array) The [actions](https://docs.medusajs.com/resources/references/fulfillment/interfaces/fulfillment.OrderChangeActionDTO) to edit the order
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [confirmOrderEditRequestWorkflow](https://docs.medusajs.com/references/medusa-workflows/confirmOrderEditRequestWorkflow)

***

### order-edit.canceled&#xA;

Emitted when an order edit request is canceled.

#### Payload

```ts
{
  order_id, // The ID of the order
  actions, // (array) The [actions](https://docs.medusajs.com/resources/references/fulfillment/interfaces/fulfillment.OrderChangeActionDTO) to edit the order
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [cancelBeginOrderEditWorkflow](https://docs.medusajs.com/references/medusa-workflows/cancelBeginOrderEditWorkflow)

***

## Order Events

### Summary

|Event|Description|
|---|---|
|order.updated|Emitted when the details of an order or draft order is updated. This
doesn't include updates made by an edit.|
|order.placed|Emitted when an order is placed, or when a draft order is converted to an
order.|
|order.canceled|Emitted when an order is canceld.|
|order.completed|Emitted when orders are completed.|
|order.archived|Emitted when an order is archived.|
|order.fulfillment\_created|Emitted when a fulfillment is created for an order.|
|order.fulfillment\_canceled|Emitted when an order's fulfillment is canceled.|
|order.return\_requested|Emitted when a return request is confirmed.|
|order.return\_received|Emitted when a return is marked as received.|
|order.claim\_created|Emitted when a claim is created for an order.|
|order.exchange\_created|Emitted when an exchange is created for an order.|
|order.transfer\_requested|Emitted when an order is requested to be transferred to
another customer.|

### order.updated

Emitted when the details of an order or draft order is updated. This
doesn't include updates made by an edit.

#### Payload

```ts
{
  id, // The ID of the order
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateOrderWorkflow)
- [updateDraftOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateDraftOrderWorkflow)

***

### order.placed

Emitted when an order is placed, or when a draft order is converted to an
order.

#### Payload

```ts
{
  id, // The ID of the order
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [convertDraftOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/convertDraftOrderWorkflow)
- [completeCartWorkflow](https://docs.medusajs.com/references/medusa-workflows/completeCartWorkflow)

***

### order.canceled

Emitted when an order is canceld.

#### Payload

```ts
{
  id, // The ID of the order
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [cancelOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/cancelOrderWorkflow)

***

### order.completed

Emitted when orders are completed.

#### Payload

```ts
[{
  id, // The ID of the order
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [completeOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/completeOrderWorkflow)

***

### order.archived

Emitted when an order is archived.

#### Payload

```ts
[{
  id, // The ID of the order
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [archiveOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/archiveOrderWorkflow)

***

### order.fulfillment\_created

Emitted when a fulfillment is created for an order.

#### Payload

```ts
{
  order_id, // The ID of the order
  fulfillment_id, // The ID of the fulfillment
  no_notification, // (boolean) Whether to notify the customer
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createOrderFulfillmentWorkflow](https://docs.medusajs.com/references/medusa-workflows/createOrderFulfillmentWorkflow)

***

### order.fulfillment\_canceled

Emitted when an order's fulfillment is canceled.

#### Payload

```ts
{
  order_id, // The ID of the order
  fulfillment_id, // The ID of the fulfillment
  no_notification, // (boolean) Whether to notify the customer
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [cancelOrderFulfillmentWorkflow](https://docs.medusajs.com/references/medusa-workflows/cancelOrderFulfillmentWorkflow)

***

### order.return\_requested

Emitted when a return request is confirmed.

#### Payload

```ts
{
  order_id, // The ID of the order
  return_id, // The ID of the return
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createAndCompleteReturnOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/createAndCompleteReturnOrderWorkflow)
- [confirmReturnRequestWorkflow](https://docs.medusajs.com/references/medusa-workflows/confirmReturnRequestWorkflow)

***

### order.return\_received

Emitted when a return is marked as received.

#### Payload

```ts
{
  order_id, // The ID of the order
  return_id, // The ID of the return
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createAndCompleteReturnOrderWorkflow](https://docs.medusajs.com/references/medusa-workflows/createAndCompleteReturnOrderWorkflow)
- [confirmReturnReceiveWorkflow](https://docs.medusajs.com/references/medusa-workflows/confirmReturnReceiveWorkflow)

***

### order.claim\_created

Emitted when a claim is created for an order.

#### Payload

```ts
{
  order_id, // The ID of the order
  claim_id, // The ID of the claim
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [confirmClaimRequestWorkflow](https://docs.medusajs.com/references/medusa-workflows/confirmClaimRequestWorkflow)

***

### order.exchange\_created

Emitted when an exchange is created for an order.

#### Payload

```ts
{
  order_id, // The ID of the order
  exchange_id, // The ID of the exchange
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [confirmExchangeRequestWorkflow](https://docs.medusajs.com/references/medusa-workflows/confirmExchangeRequestWorkflow)

***

### order.transfer\_requested

Emitted when an order is requested to be transferred to
another customer.

#### Payload

```ts
{
  id, // The ID of the order
  order_change_id, // The ID of the order change created for the transfer
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [requestOrderTransferWorkflow](https://docs.medusajs.com/references/medusa-workflows/requestOrderTransferWorkflow)

***

## Payment Events

### Summary

|Event|Description|
|---|---|
|payment.captured|Emitted when a payment is captured.|
|payment.refunded|Emitted when a payment is refunded.|

### payment.captured

Emitted when a payment is captured.

#### Payload

```ts
{
  id, // the ID of the payment
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [capturePaymentWorkflow](https://docs.medusajs.com/references/medusa-workflows/capturePaymentWorkflow)
- [processPaymentWorkflow](https://docs.medusajs.com/references/medusa-workflows/processPaymentWorkflow)
- [markPaymentCollectionAsPaid](https://docs.medusajs.com/references/medusa-workflows/markPaymentCollectionAsPaid)

***

### payment.refunded

Emitted when a payment is refunded.

#### Payload

```ts
{
  id, // the ID of the payment
}
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [refundPaymentWorkflow](https://docs.medusajs.com/references/medusa-workflows/refundPaymentWorkflow)

***

## Product Category Events

### Summary

|Event|Description|
|---|---|
|product-category.created|Emitted when product categories are created.|
|product-category.updated|Emitted when product categories are updated.|
|product-category.deleted|Emitted when product categories are deleted.|

### product-category.created

Emitted when product categories are created.

#### Payload

```ts
[{
  id, // The ID of the product category
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createProductCategoriesWorkflow](https://docs.medusajs.com/references/medusa-workflows/createProductCategoriesWorkflow)

***

### product-category.updated

Emitted when product categories are updated.

#### Payload

```ts
[{
  id, // The ID of the product category
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateProductCategoriesWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateProductCategoriesWorkflow)

***

### product-category.deleted

Emitted when product categories are deleted.

#### Payload

```ts
[{
  id, // The ID of the product category
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteProductCategoriesWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteProductCategoriesWorkflow)

***

## Product Collection Events

### Summary

|Event|Description|
|---|---|
|product-collection.created|Emitted when product collections are created.|
|product-collection.updated|Emitted when product collections are updated.|
|product-collection.deleted|Emitted when product collections are deleted.|

### product-collection.created

Emitted when product collections are created.

#### Payload

```ts
[{
  id, // The ID of the product collection
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createCollectionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createCollectionsWorkflow)

***

### product-collection.updated

Emitted when product collections are updated.

#### Payload

```ts
[{
  id, // The ID of the product collection
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateCollectionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateCollectionsWorkflow)

***

### product-collection.deleted

Emitted when product collections are deleted.

#### Payload

```ts
[{
  id, // The ID of the product collection
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteCollectionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteCollectionsWorkflow)

***

## Product Option Events

### Summary

|Event|Description|
|---|---|
|product-option.updated|Emitted when product options are updated.|
|product-option.created|Emitted when product options are created.|
|product-option.deleted|Emitted when product options are deleted.|

### product-option.updated

Emitted when product options are updated.

#### Payload

```ts
[{
  id, // The ID of the product option
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateProductOptionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateProductOptionsWorkflow)

***

### product-option.created

Emitted when product options are created.

#### Payload

```ts
[{
  id, // The ID of the product option
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createProductOptionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createProductOptionsWorkflow)

***

### product-option.deleted

Emitted when product options are deleted.

#### Payload

```ts
[{
  id, // The ID of the product option
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteProductOptionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteProductOptionsWorkflow)

***

## Product Tag Events

### Summary

|Event|Description|
|---|---|
|product-tag.updated|Emitted when product tags are updated.|
|product-tag.created|Emitted when product tags are created.|
|product-tag.deleted|Emitted when product tags are deleted.|

### product-tag.updated

Emitted when product tags are updated.

#### Payload

```ts
[{
  id, // The ID of the product tag
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateProductTagsWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateProductTagsWorkflow)

***

### product-tag.created

Emitted when product tags are created.

#### Payload

```ts
[{
  id, // The ID of the product tag
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createProductTagsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createProductTagsWorkflow)

***

### product-tag.deleted

Emitted when product tags are deleted.

#### Payload

```ts
[{
  id, // The ID of the product tag
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteProductTagsWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteProductTagsWorkflow)

***

## Product Type Events

### Summary

|Event|Description|
|---|---|
|product-type.updated|Emitted when product types are updated.|
|product-type.created|Emitted when product types are created.|
|product-type.deleted|Emitted when product types are deleted.|

### product-type.updated

Emitted when product types are updated.

#### Payload

```ts
[{
  id, // The ID of the product type
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateProductTypesWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateProductTypesWorkflow)

***

### product-type.created

Emitted when product types are created.

#### Payload

```ts
[{
  id, // The ID of the product type
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createProductTypesWorkflow](https://docs.medusajs.com/references/medusa-workflows/createProductTypesWorkflow)

***

### product-type.deleted

Emitted when product types are deleted.

#### Payload

```ts
[{
  id, // The ID of the product type
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteProductTypesWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteProductTypesWorkflow)

***

## Product Variant Events

### Summary

|Event|Description|
|---|---|
|product-variant.updated|Emitted when product variants are updated.|
|product-variant.created|Emitted when product variants are created.|
|product-variant.deleted|Emitted when product variants are deleted.|

### product-variant.updated

Emitted when product variants are updated.

#### Payload

```ts
[{
  id, // The ID of the product variant
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateProductVariantsWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateProductVariantsWorkflow)
- [batchProductVariantsWorkflow](https://docs.medusajs.com/references/medusa-workflows/batchProductVariantsWorkflow)

***

### product-variant.created

Emitted when product variants are created.

#### Payload

```ts
[{
  id, // The ID of the product variant
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createProductVariantsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createProductVariantsWorkflow)
- [createProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createProductsWorkflow)
- [batchProductVariantsWorkflow](https://docs.medusajs.com/references/medusa-workflows/batchProductVariantsWorkflow)
- [batchProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/batchProductsWorkflow)
- [importProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/importProductsWorkflow)

***

### product-variant.deleted

Emitted when product variants are deleted.

#### Payload

```ts
[{
  id, // The ID of the product variant
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteProductVariantsWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteProductVariantsWorkflow)
- [batchProductVariantsWorkflow](https://docs.medusajs.com/references/medusa-workflows/batchProductVariantsWorkflow)

***

## Product Events

### Summary

|Event|Description|
|---|---|
|product.updated|Emitted when products are updated.|
|product.created|Emitted when products are created.|
|product.deleted|Emitted when products are deleted.|

### product.updated

Emitted when products are updated.

#### Payload

```ts
[{
  id, // The ID of the product
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateProductsWorkflow)
- [batchProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/batchProductsWorkflow)
- [importProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/importProductsWorkflow)

***

### product.created

Emitted when products are created.

#### Payload

```ts
[{
  id, // The ID of the product
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createProductsWorkflow)
- [batchProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/batchProductsWorkflow)
- [importProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/importProductsWorkflow)

***

### product.deleted

Emitted when products are deleted.

#### Payload

```ts
[{
  id, // The ID of the product
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteProductsWorkflow)
- [batchProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/batchProductsWorkflow)
- [importProductsWorkflow](https://docs.medusajs.com/references/medusa-workflows/importProductsWorkflow)

***

## Region Events

### Summary

|Event|Description|
|---|---|
|region.updated|Emitted when regions are updated.|
|region.created|Emitted when regions are created.|
|region.deleted|Emitted when regions are deleted.|

### region.updated

Emitted when regions are updated.

#### Payload

```ts
[{
  id, // The ID of the region
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateRegionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateRegionsWorkflow)

***

### region.created

Emitted when regions are created.

#### Payload

```ts
[{
  id, // The ID of the region
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createRegionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createRegionsWorkflow)

***

### region.deleted

Emitted when regions are deleted.

#### Payload

```ts
[{
  id, // The ID of the region
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteRegionsWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteRegionsWorkflow)

***

## Sales Channel Events

### Summary

|Event|Description|
|---|---|
|sales-channel.created|Emitted when sales channels are created.|
|sales-channel.updated|Emitted when sales channels are updated.|
|sales-channel.deleted|Emitted when sales channels are deleted.|

### sales-channel.created

Emitted when sales channels are created.

#### Payload

```ts
[{
  id, // The ID of the sales channel
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createSalesChannelsWorkflow](https://docs.medusajs.com/references/medusa-workflows/createSalesChannelsWorkflow)

***

### sales-channel.updated

Emitted when sales channels are updated.

#### Payload

```ts
[{
  id, // The ID of the sales channel
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateSalesChannelsWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateSalesChannelsWorkflow)

***

### sales-channel.deleted

Emitted when sales channels are deleted.

#### Payload

```ts
[{
  id, // The ID of the sales channel
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteSalesChannelsWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteSalesChannelsWorkflow)

***

## Shipping Option Type Events

### Summary

|Event|Description|
|---|---|
|shipping-option-type.updated|Emitted when shipping option types are updated.|
|shipping-option-type.created|Emitted when shipping option types are created.|
|shipping-option-type.deleted|Emitted when shipping option types are deleted.|

### shipping-option-type.updated&#xA;

Emitted when shipping option types are updated.

#### Payload

```ts
[{
  id, // The ID of the shipping option type
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateShippingOptionTypesWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateShippingOptionTypesWorkflow)

***

### shipping-option-type.created&#xA;

Emitted when shipping option types are created.

#### Payload

```ts
[{
  id, // The ID of the shipping option type
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createShippingOptionTypesWorkflow](https://docs.medusajs.com/references/medusa-workflows/createShippingOptionTypesWorkflow)

***

### shipping-option-type.deleted&#xA;

Emitted when shipping option types are deleted.

#### Payload

```ts
[{
  id, // The ID of the shipping option type
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteShippingOptionTypesWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteShippingOptionTypesWorkflow)

***

## User Events

### Summary

|Event|Description|
|---|---|
|user.created|Emitted when users are created.|
|user.updated|Emitted when users are updated.|
|user.deleted|Emitted when users are deleted.|

### user.created

Emitted when users are created.

#### Payload

```ts
[{
  id, // The ID of the user
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [createUsersWorkflow](https://docs.medusajs.com/references/medusa-workflows/createUsersWorkflow)
- [createUserAccountWorkflow](https://docs.medusajs.com/references/medusa-workflows/createUserAccountWorkflow)
- [acceptInviteWorkflow](https://docs.medusajs.com/references/medusa-workflows/acceptInviteWorkflow)

***

### user.updated

Emitted when users are updated.

#### Payload

```ts
[{
  id, // The ID of the user
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [updateUsersWorkflow](https://docs.medusajs.com/references/medusa-workflows/updateUsersWorkflow)

***

### user.deleted

Emitted when users are deleted.

#### Payload

```ts
[{
  id, // The ID of the user
}]
```

#### Workflows Emitting this Event

The following workflows emit this event when they're executed. These workflows are executed by Medusa's API routes. You can also view the events emitted by API routes in the [Store](https://docs.medusajs.com/api/store) and [Admin](https://docs.medusajs.com/api/admin) API references.

- [deleteUsersWorkflow](https://docs.medusajs.com/references/medusa-workflows/deleteUsersWorkflow)
- [removeUserAccountWorkflow](https://docs.medusajs.com/references/medusa-workflows/removeUserAccountWorkflow)
