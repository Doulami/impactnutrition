# Multi-Tenant Architecture Design Guide

**Last Updated:** 2025-11-03  
**Phase:** 2 — Domain Modeling & Multi-Tenant Foundation

---

## Overview

Impact Nutrition uses **shared-schema multi-tenancy** where:
- HQ manages a **master catalog** (global SKUs)
- Tenants (franchises, partners) **opt-in** to products and override pricing/content
- **No hardcoded config** — all tenant settings in database
- **Repository layer** enforces tenant isolation automatically

---

## Tenant Model

### **Tenant Entity**

```typescript
// backend/src/modules/tenant/models/tenant.ts
export class Tenant {
  id: string;                    // Primary key (e.g., 'hq', 'tenant_paris')
  name: string;                  // Display name
  currency_code: string;         // ISO 4217 (TND, EUR, USD)
  default_locale: string;        // BCP 47 (fr, en, ar)
  tax_rate?: number;             // Nullable; admin sets per-product if null
  tax_inclusive_pricing: boolean; // true = prices include tax
  allowed_payment_methods: string[]; // ['stripe', 'cash_on_delivery']
  shipping_regions: string[];    // ISO 3166-1 alpha-2 (['TN', 'DZ'])
  domain?: string;               // Custom domain (impactnutrition.com.tn)
  subdomain?: string;            // Subdomain (paris.impact.dev)
  capabilities: Record<string, boolean>; // Feature flags
  status: 'active' | 'suspended' | 'archived';
  created_at: Date;
  updated_at: Date;
}
```

### **HQ Tenant (Default)**

```json
{
  "id": "hq",
  "name": "Impact Nutrition HQ",
  "currency_code": "TND",
  "default_locale": "fr",
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

---

## Master Catalog Model

### **Product Ownership**

- **HQ creates products** → `tenant_id = 'hq'`
- **Tenants opt-in** → `tenant_product` join table tracks which products each tenant sells

### **Schema:**

```sql
-- Core product (owned by HQ)
CREATE TABLE product (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenant(id) DEFAULT 'hq',
  title TEXT NOT NULL,
  description TEXT,
  handle TEXT UNIQUE,
  status TEXT DEFAULT 'draft',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant opt-in
CREATE TABLE tenant_product (
  tenant_id TEXT REFERENCES tenant(id),
  product_id TEXT REFERENCES product(id),
  enabled BOOLEAN DEFAULT true,
  custom_title TEXT,           -- Tenant can override product title
  custom_description TEXT,      -- Tenant can override description
  custom_metadata JSONB,        -- Tenant-specific attributes
  PRIMARY KEY (tenant_id, product_id)
);

CREATE INDEX idx_tenant_product_tenant ON tenant_product(tenant_id);
CREATE INDEX idx_tenant_product_product ON tenant_product(product_id);
```

### **Pricing Override**

Medusa's native **price lists** handle per-tenant pricing:

```typescript
// Example: HQ sets base price, Paris tenant overrides
{
  product_id: 'prod_whey_protein',
  prices: [
    { amount: 50000, currency_code: 'TND', tenant_id: 'hq' },     // 50 TND for HQ
    { amount: 1500, currency_code: 'EUR', tenant_id: 'tenant_paris' } // 15 EUR for Paris
  ]
}
```

---

## Tenant Isolation

### **Repository Layer Scoping**

All data access goes through tenant-scoped repositories:

```typescript
// backend/src/modules/tenant/repositories/tenant-scoped-repository.ts
import { FindOptionsWhere, Repository } from 'typeorm';

export class TenantScopedRepository<T> extends Repository<T> {
  constructor(
    private entity: any,
    private manager: EntityManager,
    private tenantIdField = 'tenant_id'
  ) {
    super(entity, manager);
  }

  async find(options?: FindOptionsWhere<T>): Promise<T[]> {
    const tenantId = this.getTenantContext();
    
    // HQ can see all tenants
    if (tenantId === 'hq' && this.isGlobalAdmin()) {
      return super.find(options);
    }
    
    // Other tenants see only their data
    return super.find({
      ...options,
      where: { ...options?.where, [this.tenantIdField]: tenantId }
    });
  }

  private getTenantContext(): string {
    // Injected by middleware from request context
    return this.manager.connection.getMetadata('tenant_context').tenantId || 'hq';
  }

  private isGlobalAdmin(): boolean {
    const user = this.manager.connection.getMetadata('current_user');
    return user?.role === 'GlobalAdmin';
  }
}
```

### **Middleware Injection**

```typescript
// backend/src/api/middlewares/tenant-context.ts
export function tenantContextMiddleware(req, res, next) {
  // Extract tenant from domain, subdomain, or header
  const tenantId = 
    extractTenantFromDomain(req.hostname) ||  // impactnutrition.com.tn → 'hq'
    req.headers['x-tenant-id'] ||              // API key-based
    'hq';                                      // Fallback
  
  // Inject into request scope (Medusa's DI container)
  req.scope.register('tenantId', asValue(tenantId));
  
  // Audit log
  logTenantAccess({
    tenant_id: tenantId,
    path: req.path,
    user_id: req.user?.id,
    ip: req.ip,
    timestamp: new Date()
  });
  
  next();
}
```

---

## Tenant Detection Strategies

### **1. Domain-Based (Production)**

```
impactnutrition.com.tn → tenant_id = 'hq'
paris.impactnutrition.com → tenant_id = 'tenant_paris'
sfax.impactnutrition.tn → tenant_id = 'tenant_sfax'
```

**Lookup logic:**
```typescript
function extractTenantFromDomain(hostname: string): string | null {
  const tenant = await tenantRepository.findOne({ where: { domain: hostname } });
  if (tenant) return tenant.id;
  
  // Check subdomain
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    const tenant = await tenantRepository.findOne({ where: { subdomain } });
    return tenant?.id || null;
  }
  
  return null;
}
```

### **2. Header-Based (API Keys)**

```http
GET /store/products
X-Tenant-Id: tenant_paris
X-Api-Key: pk_paris_abc123
```

### **3. Session-Based (Admin UI)**

After login, tenant stored in JWT:
```typescript
{
  user_id: 'admin_xyz',
  tenant_id: 'tenant_paris',
  role: 'TenantAdmin'
}
```

---

## Config-Driven Design

### **Tenant Configuration Schema**

All tenant settings stored in database, **zero hardcoding**:

```typescript
// backend/src/modules/tenant/types/tenant-config.ts
export interface TenantConfig {
  // Locale & Currency
  currency_code: string;
  default_locale: string;
  supported_locales?: string[];
  
  // Tax
  tax_rate?: number;
  tax_inclusive_pricing: boolean;
  tax_rules?: TaxRule[]; // Per-product-category overrides
  
  // Payments
  allowed_payment_methods: PaymentMethod[];
  payment_provider_config: Record<string, any>; // Stripe keys, etc.
  
  // Shipping
  shipping_regions: string[];
  shipping_provider_config: Record<string, any>;
  
  // Features (Capability Toggles)
  capabilities: {
    subscriptions_enabled: boolean;
    loyalty_points_enabled: boolean;
    influencer_program_enabled: boolean;
    coach_portal_enabled: boolean;
    b2b_pricing_enabled: boolean;
    gift_cards_enabled: boolean;
  };
  
  // Branding
  brand_colors?: Record<string, string>;
  logo_url?: string;
  favicon_url?: string;
}
```

### **Loading Config**

```typescript
// backend/src/modules/tenant/services/tenant-config.service.ts
export class TenantConfigService {
  async getConfig(tenantId: string): Promise<TenantConfig> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
    
    return {
      currency_code: tenant.currency_code,
      default_locale: tenant.default_locale,
      tax_rate: tenant.tax_rate,
      tax_inclusive_pricing: tenant.tax_inclusive_pricing,
      allowed_payment_methods: tenant.allowed_payment_methods,
      shipping_regions: tenant.shipping_regions,
      capabilities: tenant.capabilities,
      // ... other fields
    };
  }
}
```

---

## Data Flow Example

### **Tenant Admin Adds Product to Catalog**

1. **Login:** Tenant admin authenticates → JWT contains `tenant_id = 'tenant_paris'`
2. **Request:** `POST /admin/products/opt-in { product_id: 'prod_whey_protein' }`
3. **Middleware:** Injects `tenant_id = 'tenant_paris'` into request context
4. **RBAC Check:** `can('TenantAdmin', 'update', 'product', 'tenant_paris')` → ✅
5. **Repository:** Insert into `tenant_product`:
   ```sql
   INSERT INTO tenant_product (tenant_id, product_id, enabled)
   VALUES ('tenant_paris', 'prod_whey_protein', true);
   ```
6. **Price Override (Optional):** Tenant creates price list for EUR pricing
7. **Storefront:** Product now visible on `paris.impactnutrition.com`

---

## Migration Strategy (Phase 9)

When importing WooCommerce data:

1. **Products → HQ Master Catalog:**
   ```sql
   INSERT INTO product (id, tenant_id, title, ...)
   VALUES ('prod_001', 'hq', 'Whey Protein Isolate', ...);
   ```

2. **Auto Opt-In HQ:**
   ```sql
   INSERT INTO tenant_product (tenant_id, product_id, enabled)
   SELECT 'hq', id, true FROM product WHERE tenant_id = 'hq';
   ```

3. **Orders → HQ Tenant:**
   ```sql
   INSERT INTO "order" (id, tenant_id, email, total, ...)
   VALUES ('order_001', 'hq', 'customer@example.com', 50000, ...);
   ```

4. **Customers → HQ Tenant:**
   ```sql
   INSERT INTO customer (id, tenant_id, email, ...)
   VALUES ('cust_001', 'hq', 'customer@example.com', ...);
   ```

---

## Testing Strategy

### **Tenant Isolation Tests**

```typescript
// backend/src/modules/tenant/__tests__/isolation.spec.ts
describe('Tenant Isolation', () => {
  it('should not allow tenant A to access tenant B orders', async () => {
    const orderA = await createOrder({ tenant_id: 'tenant_a' });
    const orderB = await createOrder({ tenant_id: 'tenant_b' });
    
    // Login as Tenant A admin
    const token = await loginAs('tenant_a_admin');
    
    // Should see only Tenant A orders
    const response = await request(app)
      .get('/admin/orders')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(orderA.id);
  });
});
```

---

## Summary

**Key Principles:**
- ✅ **Zero hardcoded config** (currency, locale, tax in database)
- ✅ **Repository-layer scoping** (tenant isolation enforced automatically)
- ✅ **Master catalog + opt-in** (HQ manages global SKUs, tenants override pricing)
- ✅ **Config-driven features** (capability toggles per tenant)
- ✅ **Audit-first** (every tenant access logged)

**Next Steps (Phase 2):**
1. Implement `Tenant` entity and migration
2. Build `TenantScopedRepository` base class
3. Add tenant context middleware
4. Seed HQ tenant with sample config
5. Create sample master catalog products

---

## References

- ADR-002: Multi-tenant architecture decision
- ADR-003: RBAC model
- `/docs/data-dictionary.md` — Full schema reference
