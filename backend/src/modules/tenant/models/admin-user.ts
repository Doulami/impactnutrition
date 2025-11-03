import { model } from "@medusajs/framework/utils"

/**
 * AdminUser entity for tenant-scoped admin accounts with RBAC roles.
 */
const AdminUser = model.define("admin_user", {
  id: model.id().primaryKey(),
  email: model.text(),
  password_hash: model.text(),
  role: model.text(), // GlobalAdmin, TenantAdmin, CatalogMgr, etc.
  tenant_id: model.text().nullable(), // Null for GlobalAdmin
  capabilities: model.json(), // Per-user feature toggles
})
  .indexes([
    {
      on: ["email"],
      name: "idx_admin_user_email",
      unique: true,
    },
    {
      on: ["tenant_id"],
      name: "idx_admin_user_tenant",
    },
    {
      on: ["role"],
      name: "idx_admin_user_role",
    },
  ])

export default AdminUser
