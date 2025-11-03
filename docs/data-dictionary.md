# Data Dictionary — Impact Nutrition Platform

**Last Updated:** 2025-11-03  
**Phase:** 2 — Domain Modeling & Multi-Tenant Foundation

---

## Overview

This document defines the database schema for Impact Nutrition's multi-tenant e-commerce platform. All tables use **tenant_id scoping** for data isolation, except meta tables (`tenant`, `admin_user`, `rbac_policy`).

**Design Principles:**
- ✅ Config-driven (no hardcoded values)
- ✅ Tenant-scoped (repository layer enforces isolation)
- ✅ Medusa v2 compatible (extends native entities)
- ✅ Audit-first (timestamps + change logs)

---

## Core Entities

### **Tenant**

Master table defining each tenant (HQ, franchises, partners).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key (e.g., 'hq', 'tenant_paris') |
| `name` | TEXT | No | Display name |
| `currency_code` | TEXT | No | ISO 4217 (TND, EUR, USD) |
| `default_locale` | TEXT | No | BCP 47 (fr, en, ar) |
| `supported_locales` | JSONB | Yes | Additional locales |
| `tax_rate` | DECIMAL(5,2) | Yes | Default tax rate (nullable; admin sets per-product if null) |
| `tax_inclusive_pricing` | BOOLEAN | No | Default false; true = prices include tax |
| `tax_rules` | JSONB | Yes | Per-category tax overrides |
| `allowed_payment_methods` | JSONB | No | Array of payment method IDs |
| `payment_provider_config` | JSONB | Yes | Stripe keys, etc. (encrypted) |
| `shipping_regions` | JSONB | No | ISO 3166-1 alpha-2 codes (['TN', 'DZ']) |
| `shipping_provider_config` | JSONB | Yes | Provider-specific settings |
| `domain` | TEXT | Yes | Custom domain (unique) |
| `subdomain` | TEXT | Yes | Subdomain prefix (unique) |
| `capabilities` | JSONB | No | Feature flags (subscriptions_enabled, etc.) |
| `brand_colors` | JSONB | Yes | Theme colors |
| `logo_url` | TEXT | Yes | CDN URL for logo |
| `favicon_url` | TEXT | Yes | CDN URL for favicon |
| `status` | TEXT | No | 'active', 'suspended', 'archived' |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_tenant_domain ON tenant(domain) WHERE domain IS NOT NULL;
CREATE UNIQUE INDEX idx_tenant_subdomain ON tenant(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_tenant_status ON tenant(status);
```

---

### **Product (Medusa Native + Extensions)**

Products owned by HQ; tenants opt-in via `tenant_product`.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key (Medusa format: 'prod_xyz') |
| `tenant_id` | TEXT | No | FK to tenant (default 'hq' for master catalog) |
| `title` | TEXT | No | Product name |
| `subtitle` | TEXT | Yes | Short description |
| `description` | TEXT | Yes | Full description (HTML/Markdown) |
| `handle` | TEXT | No | URL slug (unique) |
| `status` | TEXT | No | 'draft', 'published', 'archived' |
| `thumbnail` | TEXT | Yes | Primary image URL |
| `images` | JSONB | Yes | Array of image URLs |
| `weight` | INT | Yes | Grams |
| `length` | INT | Yes | Millimeters |
| `width` | INT | Yes | Millimeters |
| `height` | INT | Yes | Millimeters |
| `hs_code` | TEXT | Yes | Harmonized system code (customs) |
| `origin_country` | TEXT | Yes | ISO 3166-1 alpha-2 |
| `material` | TEXT | Yes | e.g., "Whey Protein Isolate" |
| `metadata` | JSONB | Yes | Custom fields (nutrition facts, allergens, etc.) |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_product_handle ON product(handle) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_tenant ON product(tenant_id);
CREATE INDEX idx_product_status ON product(status);
```

**Metadata Example (Sports Nutrition):**
```json
{
  "nutrition_facts": {
    "serving_size": "30g",
    "servings_per_container": 33,
    "calories": 120,
    "protein": "25g",
    "carbs": "2g",
    "fat": "1g"
  },
  "allergens": ["milk", "soy"],
  "certifications": ["halal", "gluten_free"],
  "flavor_profile": "chocolate",
  "product_goal": "muscle_building"
}
```

---

### **Product Variant (Medusa Native)**

Size/flavor combinations (e.g., "500g Chocolate").

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('variant_xyz') |
| `product_id` | TEXT | No | FK to product |
| `title` | TEXT | No | Variant name (e.g., "500g - Chocolate") |
| `sku` | TEXT | Yes | Stock keeping unit (unique) |
| `barcode` | TEXT | Yes | UPC/EAN |
| `ean` | TEXT | Yes | European Article Number |
| `inventory_quantity` | INT | No | Stock count |
| `allow_backorder` | BOOLEAN | No | Default false |
| `manage_inventory` | BOOLEAN | No | Default true |
| `weight` | INT | Yes | Grams (overrides product weight) |
| `length` | INT | Yes | Millimeters |
| `width` | INT | Yes | Millimeters |
| `height` | INT | Yes | Millimeters |
| `metadata` | JSONB | Yes | Variant-specific data |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_variant_sku ON product_variant(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_variant_product ON product_variant(product_id);
```

---

### **Product Option (Medusa Native)**

Defines variant axes (e.g., "Size", "Flavor").

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('opt_xyz') |
| `product_id` | TEXT | No | FK to product |
| `title` | TEXT | No | Option name (e.g., "Size") |
| `metadata` | JSONB | Yes | Additional config |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

---

### **Product Option Value (Medusa Native)**

Specific option choices (e.g., "250g", "500g", "1kg").

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('optval_xyz') |
| `option_id` | TEXT | No | FK to product_option |
| `value` | TEXT | No | Option value (e.g., "500g") |
| `metadata` | JSONB | Yes | Additional data |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

---

### **Tenant Product (Join Table)**

Tracks which products each tenant has opted into.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `tenant_id` | TEXT | No | FK to tenant |
| `product_id` | TEXT | No | FK to product |
| `enabled` | BOOLEAN | No | Default true (tenant can hide product) |
| `custom_title` | TEXT | Yes | Override product title for this tenant |
| `custom_description` | TEXT | Yes | Override description |
| `custom_metadata` | JSONB | Yes | Tenant-specific fields |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |

**Indexes:**
```sql
CREATE INDEX idx_tenant_product_tenant ON tenant_product(tenant_id);
CREATE INDEX idx_tenant_product_product ON tenant_product(product_id);
CREATE INDEX idx_tenant_product_enabled ON tenant_product(enabled);
```

**Primary Key:** `(tenant_id, product_id)`

---

### **Price (Medusa Native)**

Per-variant, per-region, per-tenant pricing.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('price_xyz') |
| `variant_id` | TEXT | No | FK to product_variant |
| `currency_code` | TEXT | No | ISO 4217 (TND, EUR, USD) |
| `amount` | INT | No | Price in minor units (5000 = 50.00 TND) |
| `min_quantity` | INT | Yes | Bulk pricing threshold |
| `max_quantity` | INT | Yes | Bulk pricing threshold |
| `price_list_id` | TEXT | Yes | FK to price_list (tenant-specific lists) |
| `region_id` | TEXT | Yes | FK to region |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

**Indexes:**
```sql
CREATE INDEX idx_price_variant ON price(variant_id);
CREATE INDEX idx_price_currency ON price(currency_code);
CREATE INDEX idx_price_list ON price(price_list_id);
```

**Example (Tenant Pricing Override):**
```sql
-- HQ base price
INSERT INTO price (variant_id, currency_code, amount, price_list_id)
VALUES ('variant_whey_500g', 'TND', 50000, NULL);

-- Paris tenant override
INSERT INTO price (variant_id, currency_code, amount, price_list_id)
VALUES ('variant_whey_500g', 'EUR', 1500, 'pricelist_tenant_paris');
```

---

### **Region (Medusa Native)**

Geographic regions with currency/tax config.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('reg_xyz') |
| `name` | TEXT | No | Region name (e.g., "Tunisia") |
| `currency_code` | TEXT | No | ISO 4217 |
| `tax_rate` | DECIMAL(5,2) | No | Default tax rate (can be overridden per-tenant) |
| `tax_code` | TEXT | Yes | Tax jurisdiction code |
| `countries` | JSONB | No | ISO 3166-1 alpha-2 codes (['TN']) |
| `metadata` | JSONB | Yes | Additional config |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

---

### **Order (Medusa Native + Tenant Scoping)**

Customer orders scoped to tenant.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('order_xyz') |
| `tenant_id` | TEXT | No | FK to tenant |
| `customer_id` | TEXT | Yes | FK to customer (nullable for guest checkout) |
| `email` | TEXT | No | Order email |
| `status` | TEXT | No | 'pending', 'completed', 'canceled', 'refunded' |
| `fulfillment_status` | TEXT | No | 'not_fulfilled', 'partially_fulfilled', 'fulfilled' |
| `payment_status` | TEXT | No | 'not_paid', 'awaiting', 'captured', 'refunded' |
| `currency_code` | TEXT | No | ISO 4217 |
| `tax_rate` | DECIMAL(5,2) | Yes | Applied tax rate |
| `subtotal` | INT | No | Sum of line items (minor units) |
| `discount_total` | INT | No | Total discounts applied |
| `shipping_total` | INT | No | Shipping cost |
| `tax_total` | INT | No | Total tax |
| `total` | INT | No | Grand total |
| `metadata` | JSONB | Yes | Order notes, custom fields |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `canceled_at` | TIMESTAMPTZ | Yes | Cancelation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_order_tenant ON "order"(tenant_id);
CREATE INDEX idx_order_customer ON "order"(customer_id);
CREATE INDEX idx_order_status ON "order"(status);
CREATE INDEX idx_order_created ON "order"(created_at);
```

---

### **Customer (Medusa Native + Tenant Scoping)**

Customer accounts scoped to tenant.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('cus_xyz') |
| `tenant_id` | TEXT | No | FK to tenant |
| `email` | TEXT | No | Unique per tenant |
| `first_name` | TEXT | Yes | Customer first name |
| `last_name` | TEXT | Yes | Customer last name |
| `phone` | TEXT | Yes | Phone number |
| `has_account` | BOOLEAN | No | Default false (guest vs. registered) |
| `metadata` | JSONB | Yes | Loyalty points, preferences, etc. |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

**Indexes:**
```sql
CREATE INDEX idx_customer_tenant ON customer(tenant_id);
CREATE INDEX idx_customer_email ON customer(email);
CREATE UNIQUE INDEX idx_customer_tenant_email ON customer(tenant_id, email) WHERE deleted_at IS NULL;
```

---

## Admin & RBAC Entities

### **Admin User**

Admin/staff accounts with tenant-scoped roles.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('admin_xyz') |
| `email` | TEXT | No | Unique across all tenants |
| `password_hash` | TEXT | No | bcrypt hash |
| `role` | TEXT | No | GlobalAdmin, TenantAdmin, CatalogMgr, etc. |
| `tenant_id` | TEXT | Yes | FK to tenant (null for GlobalAdmin) |
| `capabilities` | JSONB | No | Per-user feature toggles |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |
| `deleted_at` | TIMESTAMPTZ | Yes | Soft delete |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_admin_user_email ON admin_user(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_user_tenant ON admin_user(tenant_id);
CREATE INDEX idx_admin_user_role ON admin_user(role);
```

---

### **RBAC Policy**

Policy definitions for role-based permissions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('policy_xyz') |
| `role` | TEXT | No | Role name (GlobalAdmin, TenantAdmin, etc.) |
| `resource` | TEXT | No | Resource type (product, order, customer) |
| `actions` | JSONB | No | Array of allowed actions (['create', 'read', 'update']) |
| `conditions` | JSONB | Yes | Additional constraints (e.g., "own orders only") |
| `version` | INT | No | Policy version (for rollback) |
| `effective_from` | TIMESTAMPTZ | No | Policy activation date |
| `effective_until` | TIMESTAMPTZ | Yes | Policy expiration date |
| `created_at` | TIMESTAMPTZ | No | Default NOW() |
| `updated_at` | TIMESTAMPTZ | No | Default NOW() |

**Indexes:**
```sql
CREATE INDEX idx_policy_role ON rbac_policy(role);
CREATE INDEX idx_policy_resource ON rbac_policy(resource);
CREATE INDEX idx_policy_effective ON rbac_policy(effective_from, effective_until);
```

---

### **Audit Log**

Tracks all admin actions for compliance.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | No | Primary key ('audit_xyz') |
| `tenant_id` | TEXT | No | FK to tenant |
| `user_id` | TEXT | Yes | FK to admin_user (null for system actions) |
| `action` | TEXT | No | Action performed (create, update, delete, read) |
| `resource` | TEXT | No | Resource type (product, order, etc.) |
| `resource_id` | TEXT | Yes | Specific resource ID |
| `ip_address` | TEXT | Yes | Client IP |
| `user_agent` | TEXT | Yes | Browser/client info |
| `metadata` | JSONB | Yes | Request payload, response status |
| `timestamp` | TIMESTAMPTZ | No | Default NOW() |

**Indexes:**
```sql
CREATE INDEX idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_action ON audit_log(action);
```

**Retention:** 90 days hot, 2 years cold archive.

---

## Summary

**Key Schema Features:**
- ✅ **Tenant scoping** on all core entities (`tenant_id`)
- ✅ **Config-driven** (tax, currency, locales in database)
- ✅ **Audit-first** (timestamps + audit_log table)
- ✅ **Medusa-compatible** (extends native entities, not replacing)

**Next Steps:**
- Implement migrations for custom tables (`tenant`, `tenant_product`, `admin_user`, `rbac_policy`, `audit_log`)
- Extend Medusa entities with `tenant_id` columns
- Build repository layer with automatic tenant scoping

---

## References

- ADR-002: Multi-tenant architecture
- ADR-003: RBAC model
- `/docs/multi-tenant-design.md` — Implementation guide
- [Medusa v2 Data Models](https://docs.medusajs.com/resources/references/data-models)
