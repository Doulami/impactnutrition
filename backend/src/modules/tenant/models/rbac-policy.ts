import { model } from "@medusajs/framework/utils"

/**
 * RbacPolicy stores role-based permission policies (config-driven).
 */
const RbacPolicy = model.define("rbac_policy", {
  id: model.id().primaryKey(),
  role: model.text(),
  resource: model.text(),
  actions: model.json(), // Array of allowed actions (create, read, update, delete)
  conditions: model.json().nullable(), // Additional constraints
  version: model.number(),
  effective_from: model.dateTime(),
  effective_until: model.dateTime().nullable(),
})
  .indexes([
    {
      on: ["role"],
      name: "idx_policy_role",
    },
    {
      on: ["resource"],
      name: "idx_policy_resource",
    },
    {
      on: ["effective_from", "effective_until"],
      name: "idx_policy_effective",
    },
  ])

export default RbacPolicy
