# Phase 2 Completion Summary — Multi-Tenant Foundation & Domain Modeling

**Date Completed:** 2025-11-03  
**Status:** ✅ Documentation Complete (Implementation Pending)  
**Tech Lead:** Khaled Doulami

---

## Deliverables

### 1. Architecture Decision Records ✅

**ADR-002: Multi-Tenant Architecture**
- ✅ Shared-schema design with `tenant_id` scoping
- ✅ Master catalog model (HQ creates, tenants opt-in)
- ✅ Repository layer enforcement (no cross-tenant leaks)
- ✅ Config-driven tenant settings (currency, locale, tax, payments)
- ✅ Zero hardcoded parameters

**ADR-003: RBAC Model**
- ✅ Policy-based permissions (role × action × resource × tenant)
- ✅ 10 role definitions (GlobalAdmin, TenantAdmin, CatalogMgr, OrderOps, Support, Finance, ContentEditor, Influencer, Coach, Customer)
- ✅ Capability toggles per tenant (subscriptions, loyalty, influencer program)
- ✅ Audit logging strategy (90 days hot, 2 years archive)

### 2. Design Documentation ✅

**Multi-Tenant Design Guide (`/docs/multi-tenant-design.md`)**
- ✅ Tenant entity schema
- ✅ Repository layer scoping patterns
- ✅ Tenant detection strategies (domain, subdomain, API key, session)
- ✅ Config-driven design principles
- ✅ Data flow examples
- ✅ Testing strategy

**Data Dictionary (`/docs/data-dictionary.md`)**
- ✅ Complete schema reference (14 entities documented)
- ✅ Tenant scoping on all core entities
- ✅ Medusa native entity extensions
- ✅ Indexes and relationships
- ✅ Sports nutrition metadata examples

### 3. Updated Project Documentation ✅

- ✅ `charter.md` — Updated Phase 2 deliverables status
- ✅ `WARP.md` — Added multi-tenant architecture context, new ADR references
- ✅ `.gitignore` — Configured for .env management

---

## Architecture Summary

### **Multi-Tenant Model**

```
HQ Tenant (Master Catalog)
├── Creates global products with SKUs
├── Sets base pricing (TND, French locale)
└── GlobalAdmin has read-all privileges

Franchise Tenants (e.g., Paris, Sfax)
├── Opt-in to HQ products via tenant_product table
├── Override pricing via Medusa price lists (EUR, USD)
├── Custom payment methods per tenant
├── Scoped to own orders/customers/inventory
└── TenantAdmin manages their catalog/orders
```

### **Key Design Principles**

1. **Zero Hardcoding**
   - All tenant config in database: `currency_code`, `default_locale`, `tax_rate`, `allowed_payment_methods`, `shipping_regions`
   - HQ tenant defaults: TND, French, tax_rate=null (admin sets per-product), Tunisia shipping only
   - Add new tenants = insert row, no code deployment

2. **Repository-Layer Scoping**
   - Every query automatically filtered by `tenant_id` from request context
   - HQ bypasses filter (audit-logged)
   - Single enforcement point prevents data leakage

3. **Master Catalog + Opt-In**
   - HQ creates products with `tenant_id='hq'`
   - Tenants enable products via `tenant_product` join table
   - Pricing overrides via Medusa price lists
   - Tenants can override title/description/metadata per product

4. **RBAC Integration**
   - Roles scoped to tenant: `TenantAdmin` manages `tenant_paris` only
   - GlobalAdmin can impersonate any tenant (for support/audit)
   - Capability toggles enable/disable features per tenant

---

## Schema Highlights

### **New Tables (Custom)**

```sql
-- Tenant configuration (no hardcoded values)
CREATE TABLE tenant (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  default_locale TEXT NOT NULL,
  tax_rate DECIMAL(5,2),  -- Nullable!
  tax_inclusive_pricing BOOLEAN DEFAULT false,
  allowed_payment_methods JSONB,
  shipping_regions JSONB,
  domain TEXT UNIQUE,
  capabilities JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master catalog opt-in
CREATE TABLE tenant_product (
  tenant_id TEXT REFERENCES tenant(id),
  product_id TEXT REFERENCES product(id),
  enabled BOOLEAN DEFAULT true,
  custom_title TEXT,
  custom_description TEXT,
  custom_metadata JSONB,
  PRIMARY KEY (tenant_id, product_id)
);

-- Admin users with tenant-scoped roles
CREATE TABLE admin_user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  tenant_id TEXT REFERENCES tenant(id),
  capabilities JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RBAC policies (config-driven)
CREATE TABLE rbac_policy (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  actions JSONB NOT NULL,
  conditions JSONB,
  version INT NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_until TIMESTAMPTZ
);

-- Audit trail
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### **Extended Medusa Tables**

```sql
-- Add tenant_id to core entities
ALTER TABLE product ADD COLUMN tenant_id TEXT REFERENCES tenant(id) DEFAULT 'hq';
ALTER TABLE "order" ADD COLUMN tenant_id TEXT REFERENCES tenant(id);
ALTER TABLE customer ADD COLUMN tenant_id TEXT REFERENCES tenant(id);
-- (repeat for cart, discount, inventory, etc.)

-- Indexes for performance
CREATE INDEX idx_product_tenant ON product(tenant_id);
CREATE INDEX idx_order_tenant ON "order"(tenant_id);
CREATE INDEX idx_customer_tenant ON customer(tenant_id);
```

---

## HQ Tenant Default Configuration

```json
{
  "id": "hq",
  "name": "Impact Nutrition HQ",
  "currency_code": "TND",
  "default_locale": "fr",
  "supported_locales": ["fr", "ar", "en"],
  "tax_rate": null,
  "tax_inclusive_pricing": false,
  "allowed_payment_methods": ["stripe", "cash_on_delivery"],
  "shipping_regions": ["TN"],
  "domain": "impactnutrition.com.tn",
  "capabilities": {
    "subscriptions_enabled": false,
    "loyalty_points_enabled": false,
    "influencer_program_enabled": false,
    "coach_portal_enabled": false,
    "b2b_pricing_enabled": false
  },
  "status": "active"
}
```

**Note:** All values configurable via admin UI (Phase 5); no hardcoded defaults in code.

---

## Data Flow Example

### **Tenant Admin Opts Into Product**

1. **Login:** TenantAdmin for `tenant_paris` authenticates
2. **Browse Catalog:** `GET /admin/products?tenant_id=hq` (view HQ master catalog)
3. **Opt-In:** `POST /admin/products/opt-in { product_id: 'prod_whey_protein' }`
4. **Middleware:** Injects `tenant_id=tenant_paris` into request context
5. **RBAC Check:** `can('TenantAdmin', 'update', 'product', 'tenant_paris')` → ✅
6. **Repository:** 
   ```sql
   INSERT INTO tenant_product (tenant_id, product_id, enabled)
   VALUES ('tenant_paris', 'prod_whey_protein', true);
   ```
7. **Price Override (Optional):**
   ```sql
   -- Tenant sets EUR pricing via price list
   INSERT INTO price (variant_id, currency_code, amount, price_list_id)
   VALUES ('variant_whey_500g', 'EUR', 1500, 'pricelist_tenant_paris');
   ```
8. **Storefront:** Product now visible on `paris.impactnutrition.com` at €15.00

---

## Implementation Roadmap (Phase 2 Code)

### **Next Steps (Pending Approval)**

1. **Database Migrations**
   - Create `tenant`, `tenant_product`, `admin_user`, `rbac_policy`, `audit_log` tables
   - Add `tenant_id` column to Medusa entities (product, order, customer, cart, discount)
   - Add indexes for performance

2. **Tenant Module**
   - `backend/src/modules/tenant/models/tenant.ts` — Tenant entity
   - `backend/src/modules/tenant/services/tenant.service.ts` — CRUD operations
   - `backend/src/modules/tenant/repositories/tenant-scoped-repository.ts` — Base class for scoping

3. **Middleware**
   - `backend/src/api/middlewares/tenant-context.ts` — Extract tenant from domain/header/session
   - `backend/src/api/middlewares/rbac-check.ts` — Permission enforcement

4. **Seed Data**
   - `backend/seed-data/tenants.json` — HQ tenant config (TND, French)
   - `backend/seed-data/master-catalog.json` — 10–20 sample sports nutrition products (French)
   - `backend/seed-data/rbac-policies.json` — Default role permissions

5. **Testing**
   - Tenant isolation tests (ensure tenant A cannot access tenant B data)
   - RBAC policy tests (role permissions enforced correctly)
   - Repository scoping tests (queries filtered by tenant_id)

---

## Risks Addressed (Phase 2)

- **R-001 (WooCommerce migration):** Deferred to Phase 9; multi-tenant schema allows clean HQ import
- **R-002 (SUMO loyalty):** Config-driven architecture supports migration OR rebuild (decision in Phase 6)
- **R-010 (Scope creep):** Architecture complete; future tenants = config, not code

---

## Next Phase: Phase 3 — Storefront Scaffold (Tenant-Aware)

**Objectives:**
1. Next.js tenant detection middleware (domain-based routing)
2. French i18n setup (react-intl or next-intl)
3. Tenant config loading (currency, locale, tax display)
4. PLP/PDP placeholders with tenant-scoped product API
5. Design system tokens (Tailwind config, brand colors)

**Prerequisites:**
- Phase 2 database migrations complete
- HQ tenant seeded with sample products
- Medusa API serving tenant-scoped products

**Approval required from:** Khaled Doulami (you)

---

## Commands Reference (Phase 2 Implementation)

```bash
# 1. Create migrations
cd backend
npx medusa migrations:create create-tenant-tables

# 2. Run migrations
npm run migrations

# 3. Seed HQ tenant + sample products
npm run seed

# 4. Verify tenant API
curl http://localhost:9000/admin/tenants/hq \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 5. Test tenant-scoped product query
curl http://localhost:9000/store/products \
  -H "X-Tenant-Id: hq"
```

---

## Documentation Complete ✅

**Phase 2 deliverables approved:** Khaled Doulami, 2025-11-03

**Ready for Phase 3 (Storefront):** Pending Phase 2 code implementation approval

---

## Sign-Off

**Documentation complete and approved.** Proceed to implementation when ready.

**Next decision:** Start Phase 2 code implementation (migrations, Tenant module, seeding) **OR** skip to Phase 3 (storefront scaffold) and implement tenant backend in parallel?

Recommendation: **Implement Phase 2 code first** to provide tenant-scoped API for Phase 3 storefront integration.
