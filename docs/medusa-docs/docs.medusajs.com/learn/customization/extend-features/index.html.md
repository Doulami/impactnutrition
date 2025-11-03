# Extend Core Commerce Features

In the upcoming chapters, you'll learn about the concepts and tools to extend Medusa's core commerce features.

In other commerce platforms, you extend core features and models through hacky workarounds that can introduce unexpected issues and side effects across the platform. It also makes your application difficult to maintain and upgrade in the long run.

The Medusa Framework and orchestration tools mitigate these issues while supporting all your customization needs:

- [Module Links](https://docs.medusajs.com/learn/fundamentals/module-links): Link data models of different modules without building direct dependencies, ensuring that the Medusa application integrates your modules without side effects.
- [Workflow Hooks](https://docs.medusajs.com/learn/fundamentals/workflows/workflow-hooks): inject custom functionalities into a workflow at predefined points, called hooks. This allows you to perform custom actions as a part of a core workflow without hacky workarounds.
- [Additional Data in API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes/additional-data): Configure core API routes to accept request parameters relevant to your customizations. These parameters are passed to the underlying workflow's hooks, where you can manage your custom data as part of an existing flow.

***

## Next Chapters: Link Brands to Products Example

The next chapters explain how to use the tools mentioned above with step-by-step guides. You'll continue with the [brands example from the previous chapters](https://docs.medusajs.com/learn/customization/custom-features) to:

- Link brands from the custom [Brand Module](https://docs.medusajs.com/learn/customization/custom-features/module) to products from Medusa's [Product Module](https://docs.medusajs.com/resources/commerce-modules/product).
- Extend the core product-creation workflow and the API route that uses it to allow setting the brand of a newly created product.
- Retrieve a product's associated brand's details.
