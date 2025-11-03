import { model } from "@medusajs/framework/utils"

/**
 * TenantProduct join table tracking which products each tenant has opted into.
 * Allows tenants to override product title/description/metadata.
 */
const TenantProduct = model.define("tenant_product", {
  id: model.id().primaryKey(),
  tenant_id: model.text(),
  product_id: model.text(),
  enabled: model.boolean().default(true),
  custom_title: model.text().nullable(),
  custom_description: model.text().nullable(),
  custom_metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["tenant_id"],
      name: "idx_tenant_product_tenant",
    },
    {
      on: ["product_id"],
      name: "idx_tenant_product_product",
    },
    {
      on: ["enabled"],
      name: "idx_tenant_product_enabled",
    },
  ])

export default TenantProduct
