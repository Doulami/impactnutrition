import { model } from "@medusajs/framework/utils"

/**
 * AuditLog tracks all admin actions for compliance and security.
 */
const AuditLog = model.define("audit_log", {
  id: model.id().primaryKey(),
  tenant_id: model.text(),
  user_id: model.text().nullable(), // Null for system actions
  action: model.text(), // create, read, update, delete
  resource: model.text(), // product, order, customer, etc.
  resource_id: model.text().nullable(),
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
  metadata: model.json().nullable(), // Request payload, response status
})
  .indexes([
    {
      on: ["tenant_id"],
      name: "idx_audit_tenant",
    },
    {
      on: ["user_id"],
      name: "idx_audit_user",
    },
    {
      on: ["created_at"],
      name: "idx_audit_timestamp",
    },
    {
      on: ["action"],
      name: "idx_audit_action",
    },
  ])

export default AuditLog
