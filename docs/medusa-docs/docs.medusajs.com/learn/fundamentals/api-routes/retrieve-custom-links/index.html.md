# Retrieve Custom Links from Medusa's API Route

In this chapter, you'll learn how to retrieve custom data models linked to existing Medusa data models from Medusa's API routes.

## Why Retrieve Custom Linked Data Models?

Often, you'll link custom data models to existing Medusa data models to implement custom features or expand on existing ones.

For example, to add brands for products, you can create a `Brand` data model in a Brand Module, then [define a link](https://docs.medusajs.com/learn/fundamentals/module-links) to the [Product Module](https://docs.medusajs.com/resources/commerce-modules/product)'s `Product` data model.

When you implement this customization, you might need to retrieve the brand of a product using the existing [Get Product API Route](https://docs.medusajs.com/api/admin#products_getproductsid). You can do this by passing the linked data model's name in the `fields` query parameter of the API route.

***

## How to Retrieve Custom Linked Data Models Using `fields`?

Most of Medusa's API routes accept a `fields` query parameter that allows you to specify the fields and relations to retrieve in the resource, such as a product.

For example, to retrieve the brand of a product, you can pass the `brand` field in the `fields` query parameter of the [Get Product API Route](https://docs.medusajs.com/api/admin#products_getproductsid):

```bash
curl 'http://localhost:9000/admin/products/{id}?fields=*brand' \
-H 'Authorization: Bearer {access_token}'
```

The `fields` query parameter accepts a comma-separated list of fields and relations to retrieve. To learn more about using the `fields` query parameter, refer to the [API Reference](https://docs.medusajs.com/api/store#select-fields-and-relations).

By prefixing `brand` with an asterisk (`*`), you retrieve all the default fields of the product, including the `brand` field. If you don't include the `*` prefix, the response will only include the product's brand.

***

## API Routes that Restrict Retrievable Fields

Some of Medusa's API routes restrict the fields and relations you can retrieve, which means you can't pass your custom linked data models in the `fields` query parameter. Medusa makes this restriction to ensure the API routes are performant and secure.

The API routes that restrict the fields and relations you can retrieve are:

- [Customer Store API Routes](https://docs.medusajs.com/api/store#customers)
- [Customer Admin API Routes](https://docs.medusajs.com/api/admin#customers)
- [Product Category Admin API Routes](https://docs.medusajs.com/api/admin#product-categories)

### How to Override Allowed Fields and Relations

For these routes, you need to override the allowed fields and relations to be retrieved. You can do this by applying a [global middleware](https://docs.medusajs.com/learn/fundamentals/api-routes/middlewares) to those routes.

For example, to allow retrieving the `b2b_company` of a customer using the [Get Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_getcustomersid), create the file `src/api/middlewares.ts` with the following content:

Learn how to create a middleware in the [Middlewares](https://docs.medusajs.com/learn/fundamentals/api-routes/middlewares) chapter.

```ts title="src/api/middlewares.ts" highlights={highlights}
import { defineMiddlewares } from "@medusajs/medusa"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/customers/me",
      middlewares: [
        (req, res, next) => {
          (req.allowed ??= []).push("b2b_company")
          next()
        },
      ],
    },
  ],
})
```

In this example, you apply a middleware to the [Get Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_getcustomersid).

The request object passed to middlewares has an `allowed` property that contains the fields and relations that can be retrieved. So, you modify the `allowed` array to include the `b2b_company` field.

You can now retrieve the `b2b_company` field using the `fields` query parameter of the [Get Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_getcustomersid):

```bash
curl 'http://localhost:9000/admin/customers/{id}?fields=*b2b_company' \
-H 'Authorization: Bearer {access_token}'
```

In this example, you retrieve the `b2b_company` relation of the customer using the `fields` query parameter.

This approach only works using a global middleware. It doesn't work in a route middleware.
