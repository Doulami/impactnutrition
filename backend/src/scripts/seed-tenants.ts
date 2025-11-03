import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { readFileSync } from "fs"
import { join } from "path"
import { TENANT_MODULE } from "../modules/tenant"

/**
 * Seed script for tenant module data (tenants, RBAC policies)
 */
export default async function seedTenantData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const tenantService = container.resolve(TENANT_MODULE)
  
  logger.info("Seeding tenant data...")
  
  // Load tenant data from JSON
  const tenantsPath = join(process.cwd(), "seed-data", "tenants.json")
  const tenants = JSON.parse(readFileSync(tenantsPath, "utf-8"))
  
  for (const tenantData of tenants) {
    try {
      // Check if tenant already exists
      const existing = await tenantService.retrieve(tenantData.id).catch(() => null)
      
      if (existing) {
        logger.info(`Tenant ${tenantData.id} already exists, skipping...`)
        continue
      }
      
      // Create tenant
      await tenantService.create(tenantData)
      logger.info(`✓ Created tenant: ${tenantData.id} (${tenantData.name})`)
    } catch (error) {
      logger.error(`Failed to create tenant ${tenantData.id}:`, error)
    }
  }
  
  logger.info("Seeding RBAC policies...")
  
  // Load RBAC policies from JSON
  const policiesPath = join(process.cwd(), "seed-data", "rbac-policies.json")
  const policies = JSON.parse(readFileSync(policiesPath, "utf-8"))
  
  for (const policyData of policies) {
    try {
      // Check if policy already exists
      const existing = await tenantService.retrieve("RbacPolicy", policyData.id).catch(() => null)
      
      if (existing) {
        logger.info(`Policy ${policyData.id} already exists, skipping...`)
        continue
      }
      
      // Create policy
      await tenantService.create("RbacPolicy", policyData)
      logger.info(`✓ Created policy: ${policyData.id} (${policyData.role} → ${policyData.resource})`)
    } catch (error) {
      logger.error(`Failed to create policy ${policyData.id}:`, error)
    }
  }
  
  logger.info("✓ Finished seeding tenant data")
  
  // Print summary
  const allTenants = await tenantService.list()
  logger.info(`\nTenant Summary:`)
  for (const tenant of allTenants) {
    logger.info(`  - ${tenant.id}: ${tenant.name} (${tenant.currency_code}, ${tenant.default_locale})`)
  }
}
