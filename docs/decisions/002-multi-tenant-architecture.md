# ADR-002: Multi-Tenant Architecture with Shared Schema

**Date:** 2025-11-03  
**Status:** Accepted  
**Deciders:** Khaled Doulami  
**Tags:** architecture, multi-tenant, franchising, scalability

---

## Context

Impact Nutrition requires multi-tenant architecture to support:

- **HQ (Master Tenant):** Central catalog management, global SKU definitions, cross-tenant visibility
- **Franchise Tenants:** Opt-in to master catalog, override pricing/content/media, independent payment methods
- **Future Expansion:** Influencers, coaches, B2B partners as tenants with scoped access
- **Admin Hierarchy:** HQ has read-all + override rights; tenant admins scoped to their data
- **No Cross-Tenant Leakage:** Repository layer enforces tenant isolation; audit logs track all access

**Design Constraints:**
- No hardcoded tenant config (currency, locale, tax rates)
- Config-driven: all tenant settings in database or JSON
- Data locality: single shared schema initially; sharding/regional DBs possible later
- RBAC: role × action × resource × tenant policy model

---

## Decision

We will implement **shared-schema multi-tenancy** with tenant isolation enforced at the repository/service layer.

### **Architecture Principles:**

1. **Shared Schema with `tenant_id`**
   - Every entity (product, order, customer, cart, discount) has `tenant_id` foreign key
   - Repository layer automatically scopes queries by `tenant_id` from request context
   - HQ tenant (`tenant_id = 'hq'`) has special read-all privileges

2. **Master Catalog Model**
   - HQ defines global products (master SKUs)
   - Tenants "opt-in" to products via `tenant_product` join table
   - Tenants override pricing via Medusa price lists (per-tenant, per-region)

3. **Config-Driven Tenant Settings**
   - Tenant metadata stored in `tenant` table:
     - `currency_code` (e.g., TND, EUR, USD)
     - `default_locale` (e.g., fr, en, ar)
     - `tax_rate` (nullable; if null, admin sets per-product)
     - `tax_inclusive_pricing` (boolean)
     - `allowed_payment_methods` (JSON array)
     - `shipping_regions` (JSON array)
     - `domain` (custom domain or subdomain)
   - No hardcoded defaults in code; seeded via migration or admin UI

4. **Repository Layer Scoping**
   - All repositories (ProductRepository, OrderRepository, etc.) extend `TenantScopedRepository`
   - Request middleware injects `tenant_id` into context (via domain, subdomain, or API key)
   - Queries automatically filtered: `WHERE tenant_id = :tenant_id`
   - HQ role bypasses filter for read operations (audit-logged)

5. **RBAC Integration**
   - Roles scoped to tenant: `GlobalAdmin`, `TenantAdmin`, `CatalogMgr`, `OrderOps`, `Influencer`, `Coach`
   - Permissions checked as: `can(user.role, action, resource, tenant_id)`
   - Policy config stored in database or JSON (versioned)

---

## Rationale

### **Why Shared Schema (vs. Schema-per-Tenant)?**

- **Simplicity:** Single database, single migration path, easier ops
- **Cost:** Avoid per-tenant DB overhead (connection pools, backups)
- **Master Catalog:** HQ products shared across tenants; duplication with schema-per-tenant wasteful
- **Analytics:** Cross-tenant reporting (HQ needs visibility) simpler with shared schema
- **Migration Path:** Start shared; shard later if scale demands (tenant_id makes sharding straightforward)

### **Why Repository-Layer Scoping (vs. Application-Layer)?**

- **Security:** Single enforcement point; impossible to bypass in controllers
- **DRY:** Avoid repeating `WHERE tenant_id = ?` in every query
- **Audit:** Middleware logs tenant context on every request
- **Performance:** Database indexes on `tenant_id` optimize filtering

### **Why Config-Driven (vs. Hardcoded)?**

- **Flexibility:** New tenant onboarding = insert row, no code deploy
- **A/B Testing:** Change tax rules, payment methods without redeploy
- **Localization:** Add currencies/locales on-demand
- **Phase Gating:** Build infra once; add tenants incrementally

---

## Consequences

### Positive
- **Scalability:** Add tenants without code changes
- **Isolation:** Tenant data leakage prevented by DAL
- **HQ Control:** Master catalog + override model supports franchising
- **Future-Proof:** Supports influencers, coaches, B2B as "tenants" with different roles
- **Migration-Ready:** WooCommerce data imports into HQ tenant cleanly

### Negative
- **Complexity:** Repository layer adds abstraction vs. plain ORM
- **Query Performance:** Every query has `tenant_id` filter (mitigated by indexes)
- **Testing:** Need tenant isolation tests, mock tenant context in unit tests
- **Sharding Later:** If 100+ tenants, may need regional DB splits (manageable via `tenant_id`)

### Neutral
- **Medusa v2 Compatibility:** Medusa supports multi-region/currency natively; tenant layer sits above this
- **Database Size:** Shared schema grows with all tenants; monitoring/archival needed post-launch

---

## Alternatives Considered

### 1. Schema-per-Tenant (Separate Databases)
- **Pros:** Strongest isolation, easier per-tenant backups, sharding built-in
- **Cons:** Master catalog duplication, connection pool overhead, migration complexity (100 DBs × 1 migration), cross-tenant analytics hard
- **Reason for rejection:** Overkill for Phase 1–6; master catalog model doesn't fit

### 2. Application-Layer Tenant Filtering
- **Pros:** No repository abstraction, simpler DAL
- **Cons:** Error-prone (forget `WHERE tenant_id` = leak), no single enforcement point, harder to audit
- **Reason for rejection:** Security risk; repository layer is standard pattern (Rails, Django, Laravel)

### 3. Microservices per Tenant
- **Pros:** Ultimate isolation, scale tenants independently
- **Cons:** Operational nightmare (100 tenant × 5 services = 500 deployments), latency (inter-service calls), master catalog sync complexity
- **Reason for rejection:** Premature optimization; not needed until 1000+ tenants

---

## Implementation Notes

### Phase 2 Tasks

1. **Database Schema:**
   ```sql
   -- Tenant table
   CREATE TABLE tenant (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     currency_code TEXT NOT NULL,
     default_locale TEXT NOT NULL,
     tax_rate DECIMAL(5,2),
     tax_inclusive_pricing BOOLEAN DEFAULT false,
     allowed_payment_methods JSONB,
     shipping_regions JSONB,
     domain TEXT UNIQUE,
     status TEXT DEFAULT 'active',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Add tenant_id to core entities (Medusa tables)
   ALTER TABLE product ADD COLUMN tenant_id TEXT REFERENCES tenant(id);
   ALTER TABLE "order" ADD COLUMN tenant_id TEXT REFERENCES tenant(id);
   ALTER TABLE customer ADD COLUMN tenant_id TEXT REFERENCES tenant(id);
   -- (repeat for cart, discount, inventory, etc.)

   -- Master catalog opt-in
   CREATE TABLE tenant_product (
     tenant_id TEXT REFERENCES tenant(id),
     product_id TEXT REFERENCES product(id),
     enabled BOOLEAN DEFAULT true,
     PRIMARY KEY (tenant_id, product_id)
   );
   ```

2. **Repository Layer:**
   ```typescript
   // backend/src/modules/tenant/repositories/tenant-scoped.ts
   export class TenantScopedRepository<T> {
     constructor(protected manager: EntityManager) {}
     
     protected applyTenantScope(qb: QueryBuilder, tenantId: string) {
       if (tenantId !== 'hq') {
         qb.andWhere('tenant_id = :tenantId', { tenantId });
       }
       // HQ bypasses filter (logged separately)
     }
   }
   ```

3. **Middleware:**
   ```typescript
   // backend/src/api/middlewares/tenant-context.ts
   export function tenantContextMiddleware(req, res, next) {
     const tenantId = extractTenantFromDomain(req.hostname) 
                   || req.headers['x-tenant-id']
                   || 'hq'; // fallback to HQ
     
     req.scope.register('tenantId', asValue(tenantId));
     req.auditLog({ tenantId, path: req.path, user: req.user?.id });
     next();
   }
   ```

4. **Seed HQ Tenant:**
   ```typescript
   // backend/seed-data/tenants.json
   {
     "id": "hq",
     "name": "Impact Nutrition HQ",
     "currency_code": "TND",
     "default_locale": "fr",
     "tax_rate": 19.00,
     "tax_inclusive_pricing": false,
     "allowed_payment_methods": ["stripe", "cash_on_delivery"],
     "shipping_regions": ["TN"],
     "domain": "impactnutrition.com.tn"
   }
   ```

---

## Related Decisions

- ADR-001: Medusa v2 + Next.js stack selection
- ADR-003: RBAC model (roles × actions × resources × tenant) — pending
- ADR-004: Config-driven loyalty/promotions engine — pending Phase 6

---

## References

- [Multi-Tenant SaaS Patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-architecture/welcome.html)
- [Medusa Multi-Region Guide](https://docs.medusajs.com/resources/commerce-modules/region)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Row-Level Security in PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) (future optimization)
