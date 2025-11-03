-- Seed HQ Tenant and RBAC Policies
-- Date: 2025-11-03

-- Insert HQ Tenant
INSERT INTO tenant (
  id, name, currency_code, default_locale, supported_locales,
  tax_rate, tax_inclusive_pricing, tax_rules,
  allowed_payment_methods, payment_provider_config,
  shipping_regions, shipping_provider_config,
  domain, subdomain, capabilities, brand_colors,
  logo_url, favicon_url, status
) VALUES (
  'hq',
  'Impact Nutrition HQ',
  'TND',
  'fr',
  '["fr", "ar", "en"]'::jsonb,
  NULL,
  false,
  '[]'::jsonb,
  '["stripe", "cash_on_delivery"]'::jsonb,
  '{}'::jsonb,
  '["TN"]'::jsonb,
  '{}'::jsonb,
  'impactnutrition.com.tn',
  NULL,
  '{
    "subscriptions_enabled": false,
    "loyalty_points_enabled": false,
    "influencer_program_enabled": false,
    "coach_portal_enabled": false,
    "b2b_pricing_enabled": false,
    "gift_cards_enabled": false
  }'::jsonb,
  '{
    "primary": "#000000",
    "secondary": "#FFFFFF",
    "accent": "#FF0000"
  }'::jsonb,
  NULL,
  NULL,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Insert RBAC Policies
INSERT INTO rbac_policy (id, role, resource, actions, conditions, version, effective_from, effective_until)
VALUES
  ('policy_global_admin', 'GlobalAdmin', '*', '["*"]'::jsonb, NULL, 1, '2025-11-03 00:00:00+00', NULL),
  ('policy_tenant_admin_product', 'TenantAdmin', 'product', '["create", "read", "update", "delete"]'::jsonb, NULL, 1, '2025-11-03 00:00:00+00', NULL),
  ('policy_tenant_admin_order', 'TenantAdmin', 'order', '["read", "update", "cancel"]'::jsonb, NULL, 1, '2025-11-03 00:00:00+00', NULL),
  ('policy_tenant_admin_customer', 'TenantAdmin', 'customer', '["read", "update"]'::jsonb, NULL, 1, '2025-11-03 00:00:00+00', NULL),
  ('policy_catalog_mgr_product', 'CatalogMgr', 'product', '["create", "read", "update", "delete"]'::jsonb, NULL, 1, '2025-11-03 00:00:00+00', NULL),
  ('policy_order_ops_order', 'OrderOps', 'order', '["read", "update", "fulfill", "refund"]'::jsonb, NULL, 1, '2025-11-03 00:00:00+00', NULL)
ON CONFLICT (id) DO NOTHING;
