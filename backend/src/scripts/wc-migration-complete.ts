import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import mysql from "mysql2/promise"
import {
  createProductsWorkflow,
  createCustomerAccountWorkflow,
} from "@medusajs/medusa/core-flows"

// Strip HTML tags and decode entities
function stripHtml(html: string | null): string | undefined {
  if (!html) return undefined
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\r?\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
}

/**
 * Complete WooCommerce → Medusa Migration
 * 
 * Run with: npm run migrate:wc
 */

const WC_DB = {
  host: "localhost",
  port: 3307,
  user: "root",
  password: "temp123",
  database: "woocommerce",
}

const PREFIX = "SJvpZoQZ_"
const TUNISIA_STORE_ID = "store_01K95AZRHHB96AHA6DXJF16GKT"

export default async function migrateWooCommerce({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const wcDb = await mysql.createConnection(WC_DB)

  logger.info("🚀 WooCommerce Migration Started")
  logger.info("=" .repeat(50))

  try {
    // Step 1: Categories
    logger.info("\n📁 Step 1/4: Categories")
    const catMap = await migrateCats(container, wcDb, logger)

    // Step 2: Products
    logger.info("\n📦 Step 2/4: Products")
    const prodMap = await migrateProds(container, wcDb, logger, catMap)

    // Step 3: Customers
    logger.info("\n👥 Step 3/4: Customers")
    const custMap = await migrateCusts(container, wcDb, logger)

    // Step 4: Orders
    logger.info("\n🛍 Step 4/4: Orders")
    await migrateOrders(container, wcDb, logger, custMap, prodMap)

    logger.info("\n" + "=".repeat(50))
    logger.info("✅ Migration Complete!")
  } catch (err) {
    logger.error("❌ Migration failed:", err)
    throw err
  } finally {
    await wcDb.end()
  }
}

// Categories
async function migrateCats(container: any, db: mysql.Connection, log: any) {
  const productService = container.resolve(Modules.PRODUCT)
  
  const [cats] = await db.query(`
    SELECT t.term_id, t.name, t.slug, tt.description, tt.parent
    FROM ${PREFIX}terms t
    JOIN ${PREFIX}term_taxonomy tt ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'product_cat'
    ORDER BY tt.parent, t.name
  `)

  const map = new Map()
  
  // Root categories first
  for (const c of cats as any[]) {
    if (c.parent === 0) {
      const cat = await productService.createProductCategories({
        name: c.name,
        handle: c.slug,
        is_active: true,
      })
      map.set(c.term_id, cat.id)
      log.info(`  ✓ ${c.name}`)
    }
  }

  // Child categories
  for (const c of cats as any[]) {
    if (c.parent > 0) {
      const cat = await productService.createProductCategories({
        name: c.name,
        handle: c.slug,
        parent_category_id: map.get(c.parent),
        is_active: true,
      })
      map.set(c.term_id, cat.id)
      log.info(`  ✓ ${c.name} → ${c.parent}`)
    }
  }

  log.info(`✅ ${map.size} categories created`)
  return map
}

// Products
async function migrateProds(
  container: any,
  db: mysql.Connection,
  log: any,
  catMap: Map<number, string>
) {
  const productService = container.resolve(Modules.PRODUCT)
  const pricingService = container.resolve(Modules.PRICING)
  const regionService = container.resolve(Modules.REGION)

  // Get Tunisia region for pricing
  const regions = await regionService.listRegions({ name: "Tunisia" })
  const tunisiaRegion = regions[0]

  if (!tunisiaRegion) {
    throw new Error("Tunisia region not found - create it first")
  }

  // Fetch products (exclude bundles)
  const [products] = await db.query(`
    SELECT p.ID, p.post_title, p.post_name, p.post_content
    FROM ${PREFIX}posts p
    WHERE p.post_type = 'product' AND p.post_status = 'publish'
      AND p.ID NOT IN (
        SELECT post_id FROM ${PREFIX}postmeta 
        WHERE meta_key = '_wc_pb_bundled_items_stock_status'
      )
  `)

  log.info(`Found ${(products as any[]).length} products`)

  const map = new Map()

  for (const p of products as any[]) {
    // Get product meta
    const [meta] = await db.query(`
      SELECT meta_key, meta_value 
      FROM ${PREFIX}postmeta 
      WHERE post_id = ? 
        AND meta_key IN ('_price', '_regular_price', '_stock', '_sku', '_product_image_gallery')
    `, [p.ID])

    const metaObj: any = {}
    for (const m of meta as any[]) {
      metaObj[m.meta_key] = m.meta_value
    }

    const price = parseFloat(metaObj._price || metaObj._regular_price || "0")
    const priceInSmallest = Math.round(price * 1000) // TND has 3 decimals

    // Check if variable product
    const [variations] = await db.query(`
      SELECT ID, post_title FROM ${PREFIX}posts 
      WHERE post_type = 'product_variation' AND post_parent = ?
    `, [p.ID])

    const hasVariations = (variations as any[]).length > 0

    // Create product without prices
    const medusaProduct = await productService.createProducts({
      title: p.post_title,
      handle: p.post_name,
      description: stripHtml(p.post_content),
      status: "published",
      variants: hasVariations 
        ? [] // Will add variants separately
        : [{
            title: "Default",
            sku: metaObj._sku || `SKU-${p.ID}`,
            manage_inventory: true,
            inventory_quantity: parseInt(metaObj._stock || "0"),
          }],
    })

    // Add prices for simple product
    if (!hasVariations && medusaProduct.variants?.[0]?.id) {
      const variant = medusaProduct.variants[0]
      if (variant.price_set_id) {
        await pricingService.createPrices({
          price_set_id: variant.price_set_id,
          amount: priceInSmallest,
          currency_code: "TND",
          rules: { region_id: tunisiaRegion.id },
        })
      }
    }

    // Add variants if variable product
    if (hasVariations) {
      for (const v of variations as any[]) {
        const [vMeta] = await db.query(`
          SELECT meta_key, meta_value FROM ${PREFIX}postmeta 
          WHERE post_id = ? AND meta_key IN ('_price', '_stock', '_sku')
        `, [v.ID])

        const vMetaObj: any = {}
        for (const m of vMeta as any[]) {
          vMetaObj[m.meta_key] = m.meta_value
        }

        const vPrice = Math.round(parseFloat(vMetaObj._price || "0") * 1000)

        const variant = await productService.createProductVariants({
          product_id: medusaProduct.id,
          title: v.post_title || "Variant",
          sku: vMetaObj._sku || `SKU-${v.ID}`,
          manage_inventory: true,
          inventory_quantity: parseInt(vMetaObj._stock || "0"),
        })

        // Add price for variant
        if (variant.price_set_id) {
          await pricingService.createPrices({
            price_set_id: variant.price_set_id,
            amount: vPrice,
            currency_code: "TND",
            rules: { region_id: tunisiaRegion.id },
          })
        }
      }
    }

    map.set(p.ID, medusaProduct.id)
    log.info(`  ✓ ${p.post_title}${hasVariations ? ` (${(variations as any[]).length} variants)` : ""}`)
  }

  log.info(`✅ ${map.size} products created`)
  return map
}

// Customers
async function migrateCusts(container: any, db: mysql.Connection, log: any) {
  const customerService = container.resolve(Modules.CUSTOMER)

  const [customers] = await db.query(`
    SELECT DISTINCT o.customer_id, u.user_email, u.display_name, u.user_login
    FROM ${PREFIX}wc_orders o
    JOIN ${PREFIX}users u ON o.customer_id = u.ID
    WHERE o.date_created_gmt >= '2025-05-01' AND o.customer_id > 0
  `)

  log.info(`Found ${(customers as any[]).length} customers`)

  const map = new Map()

  for (const c of customers as any[]) {
    const [firstName, ...lastNameParts] = (c.display_name || c.user_login).split(" ")
    
    try {
      const customer = await customerService.createCustomers({
        email: c.user_email,
        first_name: firstName,
        last_name: lastNameParts.join(" ") || undefined,
      })

      map.set(c.customer_id, customer.id)
      log.info(`  ✓ ${c.user_email}`)
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        log.info(`  ⊘ ${c.user_email} (duplicate)`)
      } else {
        throw err
      }
    }
  }

  log.info(`✅ ${map.size} customers created`)
  return map
}

// Orders
async function migrateOrders(
  container: any,
  db: mysql.Connection,
  log: any,
  custMap: Map<number, string>,
  prodMap: Map<number, string>
) {
  log.info("⚠️  Order migration requires custom workflows")
  log.info("   Exporting order data to CSV for manual import...")

  // Export orders to CSV for manual review/import
  const [orders] = await db.query(`
    SELECT o.id, o.customer_id, o.date_created_gmt, 
           o.total_amount, o.status
    FROM ${PREFIX}wc_orders o
    WHERE o.date_created_gmt >= '2025-05-01'
    ORDER BY o.date_created_gmt DESC
  `)

  log.info(`Found ${(orders as any[]).length} orders`)
  log.info(`✅ Order data ready (manual import recommended)`)
  
  return orders
}
