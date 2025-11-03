import { model } from "@medusajs/framework/utils"

/**
 * Tenant entity representing a franchise, partner, or HQ in the multi-tenant system.
 * All tenant configuration is stored in the database (zero hardcoding).
 */
const Tenant = model.define("tenant", {
  id: model.id().primaryKey(),
  name: model.text(),
  currency_code: model.text(),
  default_locale: model.text(),
  supported_locales: model.json().nullable(),
  tax_rate: model.number().nullable(), // Nullable: admin can set per-product
  tax_inclusive_pricing: model.boolean().default(false),
  tax_rules: model.json().nullable(),
  allowed_payment_methods: model.json(),
  payment_provider_config: model.json().nullable(),
  shipping_regions: model.json(),
  shipping_provider_config: model.json().nullable(),
  domain: model.text().nullable(),
  subdomain: model.text().nullable(),
  capabilities: model.json(),
  brand_colors: model.json().nullable(),
  logo_url: model.text().nullable(),
  favicon_url: model.text().nullable(),
  status: model.enum(["active", "suspended", "archived"]).default("active"),
})

export default Tenant
