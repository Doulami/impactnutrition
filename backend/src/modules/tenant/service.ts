import { Pool } from "pg";

/**
 * TenantService provides CRUD operations for tenants and tenant-product associations.
 */
class TenantService {
  private pool: Pool;

  constructor() {
    // Create PostgreSQL connection pool
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'medusa_dev',
      user: process.env.DB_USER || 'medusa',
      password: process.env.DB_PASSWORD || 'medusa',
    });
  }

  // ===== Tenant CRUD =====

  async listTenants() {
    const query = `SELECT * FROM tenant ORDER BY created_at DESC`;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getTenantById(id: string) {
    const query = `SELECT * FROM tenant WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getTenantByDomain(domain: string) {
    const query = `
      SELECT * FROM tenant 
      WHERE (domain = $1 OR subdomain = $1) AND status = 'active'
    `;
    const result = await this.pool.query(query, [domain]);
    return result.rows[0] || null;
  }

  async createTenant(data: any) {
    const {
      id,
      name,
      currency_code = 'TND',
      default_locale = 'fr',
      supported_locales = ['fr'],
      tax_rate = null,
      tax_inclusive_pricing = false,
      tax_rules = [],
      allowed_payment_methods = ['stripe'],
      payment_provider_config = {},
      shipping_regions = [],
      shipping_provider_config = {},
      domain,
      subdomain = null,
      capabilities = {},
      brand_colors = {},
      logo_url = null,
      favicon_url = null,
      status = 'active',
    } = data;

    const query = `
      INSERT INTO tenant (
        id, name, currency_code, default_locale, supported_locales,
        tax_rate, tax_inclusive_pricing, tax_rules,
        allowed_payment_methods, payment_provider_config,
        shipping_regions, shipping_provider_config,
        domain, subdomain, capabilities, brand_colors,
        logo_url, favicon_url, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      id, name, currency_code, default_locale, JSON.stringify(supported_locales),
      tax_rate, tax_inclusive_pricing, JSON.stringify(tax_rules),
      JSON.stringify(allowed_payment_methods), JSON.stringify(payment_provider_config),
      JSON.stringify(shipping_regions), JSON.stringify(shipping_provider_config),
      domain, subdomain, JSON.stringify(capabilities), JSON.stringify(brand_colors),
      logo_url, favicon_url, status
    ]);

    return result.rows[0];
  }

  async updateTenant(id: string, data: any) {
    const tenant = await this.getTenantById(id);
    if (!tenant) return null;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'currency_code', 'default_locale', 'supported_locales',
      'tax_rate', 'tax_inclusive_pricing', 'tax_rules',
      'allowed_payment_methods', 'payment_provider_config',
      'shipping_regions', 'shipping_provider_config',
      'domain', 'subdomain', 'capabilities', 'brand_colors',
      'logo_url', 'favicon_url', 'status'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        
        // JSON fields need to be stringified
        const jsonFields = ['supported_locales', 'tax_rules', 'allowed_payment_methods',
                            'payment_provider_config', 'shipping_regions', 'shipping_provider_config',
                            'capabilities', 'brand_colors'];
        
        values.push(jsonFields.includes(field) ? JSON.stringify(data[field]) : data[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) return tenant;

    values.push(id); // For WHERE clause

    const query = `
      UPDATE tenant 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deactivateTenant(id: string) {
    const query = `
      UPDATE tenant 
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1
    `;
    await this.pool.query(query, [id]);
  }

  // ===== Tenant Product Operations =====

  async getTenantProducts(tenantId: string) {
    const query = `SELECT * FROM tenant_product WHERE tenant_id = $1`;
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }

  async optInProduct(tenantId: string, productId: string, customData?: any) {
    const enabled = customData?.enabled ?? true;
    const customTitle = customData?.custom_title ?? null;
    const customDescription = customData?.custom_description ?? null;
    const customMetadata = customData?.custom_metadata ?? null;

    // Check if already exists
    const checkQuery = `SELECT id FROM tenant_product WHERE tenant_id = $1 AND product_id = $2`;
    const existing = await this.pool.query(checkQuery, [tenantId, productId]);

    if (existing.rows.length > 0) {
      // Update existing
      const updateQuery = `
        UPDATE tenant_product 
        SET enabled = $1, custom_title = $2, custom_description = $3, custom_metadata = $4, updated_at = NOW()
        WHERE tenant_id = $5 AND product_id = $6
        RETURNING *
      `;
      const result = await this.pool.query(updateQuery, [
        enabled, customTitle, customDescription, 
        customMetadata ? JSON.stringify(customMetadata) : null,
        tenantId, productId
      ]);
      return result.rows[0];
    } else {
      // Insert new - generate ID
      const id = `tp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const insertQuery = `
        INSERT INTO tenant_product (id, tenant_id, product_id, enabled, custom_title, custom_description, custom_metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await this.pool.query(insertQuery, [
        id, tenantId, productId, enabled, customTitle, customDescription,
        customMetadata ? JSON.stringify(customMetadata) : null
      ]);
      return result.rows[0];
    }
  }

  // ===== Legacy methods (kept for compatibility) =====

  async getTenantConfig(tenantId: string) {
    return await this.getTenantById(tenantId);
  }

  async enableProductForTenant(tenantId: string, productId: string) {
    return await this.optInProduct(tenantId, productId);
  }
}

export default TenantService;
