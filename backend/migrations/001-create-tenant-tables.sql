-- Migration: Create Tenant Tables
-- Date: 2025-11-03
-- Description: Creates tables for multi-tenant system (tenant, tenant_product, admin_user, rbac_policy, audit_log)

-- Tenant table
CREATE TABLE IF NOT EXISTS tenant (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  default_locale TEXT NOT NULL,
  supported_locales JSONB,
  tax_rate DECIMAL(5,2),
  tax_inclusive_pricing BOOLEAN DEFAULT false,
  tax_rules JSONB,
  allowed_payment_methods JSONB NOT NULL,
  payment_provider_config JSONB,
  shipping_regions JSONB NOT NULL,
  shipping_provider_config JSONB,
  domain TEXT,
  subdomain TEXT,
  capabilities JSONB NOT NULL,
  brand_colors JSONB,
  logo_url TEXT,
  favicon_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_domain ON tenant(domain) WHERE domain IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_subdomain ON tenant(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenant_status ON tenant(status);

-- Tenant Product (master catalog opt-in)
CREATE TABLE IF NOT EXISTS tenant_product (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  custom_title TEXT,
  custom_description TEXT,
  custom_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_product_tenant ON tenant_product(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_product_product ON tenant_product(product_id);
CREATE INDEX IF NOT EXISTS idx_tenant_product_enabled ON tenant_product(enabled);

-- Admin User (tenant-scoped admin accounts)
CREATE TABLE IF NOT EXISTS admin_user (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  tenant_id TEXT REFERENCES tenant(id) ON DELETE CASCADE,
  capabilities JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_user_email ON admin_user(email);
CREATE INDEX IF NOT EXISTS idx_admin_user_tenant ON admin_user(tenant_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_role ON admin_user(role);

-- RBAC Policy (config-driven permissions)
CREATE TABLE IF NOT EXISTS rbac_policy (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  actions JSONB NOT NULL,
  conditions JSONB,
  version INT NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_role ON rbac_policy(role);
CREATE INDEX IF NOT EXISTS idx_policy_resource ON rbac_policy(resource);
CREATE INDEX IF NOT EXISTS idx_policy_effective ON rbac_policy(effective_from, effective_until);

-- Audit Log (compliance tracking)
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  user_id TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- Comments
COMMENT ON TABLE tenant IS 'Multi-tenant configuration (HQ, franchises, partners)';
COMMENT ON TABLE tenant_product IS 'Master catalog opt-in tracking';
COMMENT ON TABLE admin_user IS 'Tenant-scoped admin accounts with RBAC roles';
COMMENT ON TABLE rbac_policy IS 'Config-driven permission policies';
COMMENT ON TABLE audit_log IS 'Audit trail for compliance';
