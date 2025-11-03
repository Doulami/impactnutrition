import { Module } from "@medusajs/framework/utils"
import TenantService from "./service"

export const TENANT_MODULE = "tenantModuleService"

// Export models so Medusa can discover them
export * from "./models"

// Export the module
export default Module(TENANT_MODULE, {
  service: TenantService,
})
