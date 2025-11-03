# ADR-003: Role-Based Access Control (RBAC) Model

**Date:** 2025-11-03  
**Status:** Accepted  
**Deciders:** Khaled Doulami  
**Tags:** security, rbac, authorization, multi-tenant

---

## Context

Multi-tenant platform requires fine-grained access control to support:

- **HQ Admin:** Full access across all tenants, master catalog management, override rights
- **Tenant Admin:** Full access within their tenant (catalog, orders, customers)
- **Operational Roles:** Catalog managers, order fulfillment, customer support (scoped to tenant)
- **Partner Roles:** Influencers (referral tracking), coaches (client management), limited visibility
- **Audit Requirements:** Track who accessed what, when, with which tenant context

**Design Constraints:**
- Config-driven: roles/permissions in database, not hardcoded
- Extensible: add new roles without code changes
- Tenant-scoped: permissions checked against tenant_id
- Capability toggles: enable/disable features per tenant

---

## Decision

We will implement a **policy-based RBAC system** with the formula:

```
Permission = Role × Action × Resource × Tenant
```

### **Role Definitions (Extensible)**

| Role | Scope | Description |
|------|-------|-------------|
| `GlobalAdmin` | All tenants | HQ superuser; full read/write across tenants |
| `TenantAdmin` | Single tenant | Full control within tenant (catalog, orders, settings) |
| `CatalogMgr` | Single tenant | Manage products, variants, pricing, opt-in to master catalog |
| `OrderOps` | Single tenant | View/process orders, fulfillment, refunds |
| `Support` | Single tenant | View customers, orders (read-only); chat support |
| `Finance` | Single tenant | View orders, generate reports, manage invoices |
| `ContentEditor` | Single tenant | Edit blog/guides, SEO, media uploads |
| `Influencer` | Single tenant | Generate referral codes, view commission dashboard (read-only) |
| `Coach` | Single tenant | Manage client roster, curate stacks, view client orders (limited) |
| `Customer` | Single tenant | Standard customer account (orders, profile, subscriptions) |

**Note:** Roles stored in database; new roles added via seed/migration or admin UI.

---

## Policy Model

### **Permission Check:**

```typescript
can(userRole: string, action: string, resource: string, tenantId: string): boolean
```

**Example policies:**

```json
{
  "GlobalAdmin": {
    "*": ["*"]  // All actions on all resources
  },
  "TenantAdmin": {
    "product": ["create", "read", "update", "delete"],
    "order": ["read", "update", "cancel"],
    "customer": ["read", "update"],
    "settings": ["read", "update"]
  },
  "CatalogMgr": {
    "product": ["create", "read", "update", "delete"],
    "collection": ["read", "update"],
    "price_list": ["read", "update"]
  },
  "OrderOps": {
    "order": ["read", "update", "fulfill", "refund"],
    "shipment": ["create", "read", "update"]
  },
  "Influencer": {
    "referral": ["create", "read"],
    "commission": ["read"]
  },
  "Coach": {
    "client": ["create", "read", "update"],
    "stack": ["create", "read", "update"],
    "order": ["read"]  // Limited: only client orders
  }
}
```

### **Tenant Scoping:**

- All roles (except `GlobalAdmin`) are scoped to a single `tenant_id`
- `GlobalAdmin` can impersonate any tenant (audit-logged)
- User table schema:
  ```sql
  CREATE TABLE admin_user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    tenant_id TEXT REFERENCES tenant(id),
    capabilities JSONB,  -- Feature toggles per user
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

---

## Capability Toggles (Per-Tenant)

Tenant-level feature flags control access to advanced features:

```json
{
  "tenant_id": "hq",
  "capabilities": {
    "subscriptions_enabled": true,
    "loyalty_points_enabled": true,
    "influencer_program_enabled": true,
    "coach_portal_enabled": true,
    "b2b_pricing_enabled": false
  }
}
```

**Policy enforcement:**
```typescript
if (tenant.capabilities.subscriptions_enabled && can(user.role, 'create', 'subscription', tenant.id)) {
  // Allow subscription creation
}
```

---

## Rationale

### **Why Policy-Based (vs. Role-Only)?**

- **Flexibility:** Add new resources (e.g., "bundle", "stack") without redefining roles
- **Fine-Grained:** Support "read orders but not cancel" without creating 10 roles
- **Auditability:** Policy changes tracked in config version history

### **Why Tenant-Scoped Users (vs. Global Users)?**

- **Security:** Prevents privilege escalation (TenantAdmin A cannot access Tenant B)
- **Onboarding:** Franchise admins created per-tenant; no cross-tenant visibility
- **Billing:** Per-tenant user limits easier to enforce

### **Why Capability Toggles?**

- **Upselling:** Enable influencer program for premium tenants only
- **Phased Rollout:** Test subscriptions with HQ before enabling for franchises
- **Compliance:** Disable features per region (e.g., no lottery/rewards in certain countries)

---

## Consequences

### Positive
- **Extensibility:** Add roles/resources via config, no redeploy
- **Security:** Tenant isolation + policy enforcement prevents leaks
- **HQ Control:** GlobalAdmin can audit/override without tenant admin knowing
- **Partner Support:** Influencer/Coach roles enable ecosystem growth

### Negative
- **Complexity:** Policy engine adds layer vs. simple role checks
- **Testing:** Need policy tests for all role × resource combinations
- **Performance:** Policy lookups on every request (mitigated by caching)

### Neutral
- **Admin UI:** Need role/permission management screens (Phase 5)
- **Audit Logs:** Every action logs (user, role, tenant, resource, action, timestamp)

---

## Implementation Notes

### Phase 2 Tasks

1. **Database Schema:**
   ```sql
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

   CREATE INDEX idx_admin_user_tenant ON admin_user(tenant_id);
   CREATE INDEX idx_admin_user_role ON admin_user(role);
   ```

2. **Policy Storage:**
   ```typescript
   // backend/src/modules/rbac/policies/default-policies.json
   {
     "GlobalAdmin": { "*": ["*"] },
     "TenantAdmin": {
       "product": ["create", "read", "update", "delete"],
       "order": ["read", "update", "cancel"],
       // ...
     }
   }
   ```

3. **Middleware:**
   ```typescript
   // backend/src/api/middlewares/rbac-check.ts
   export function rbacMiddleware(resource: string, action: string) {
     return (req, res, next) => {
       const { user, tenantId } = req.scope.resolve();
       
       if (!can(user.role, action, resource, tenantId, user.tenant_id)) {
         return res.status(403).json({ error: 'Forbidden' });
       }
       
       next();
     };
   }
   ```

4. **Usage Example:**
   ```typescript
   // backend/src/api/routes/products.ts
   router.post('/products', 
     rbacMiddleware('product', 'create'),
     async (req, res) => {
       const { tenantId } = req.scope.resolve();
       const product = await productService.create({ ...req.body, tenant_id: tenantId });
       res.json(product);
     }
   );
   ```

---

## Audit Logging

Every permission check logged:

```json
{
  "timestamp": "2025-11-03T12:00:00Z",
  "user_id": "admin_abc123",
  "role": "TenantAdmin",
  "tenant_id": "tenant_xyz",
  "action": "update",
  "resource": "product",
  "resource_id": "prod_456",
  "allowed": true,
  "ip": "192.168.1.1"
}
```

**Retention:** 90 days hot storage, 2 years cold archive (compliance requirement).

---

## Related Decisions

- ADR-002: Multi-tenant architecture (tenant scoping)
- ADR-004: Config-driven loyalty/promotions (capability toggles) — pending Phase 6

---

## References

- [NIST RBAC Model](https://csrc.nist.gov/projects/role-based-access-control)
- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
