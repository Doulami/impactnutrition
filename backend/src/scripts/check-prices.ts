import { Modules } from "@medusajs/framework/utils"

export default async ({ container }) => {
  const productService = container.resolve(Modules.PRODUCT)
  const pricingService = container.resolve(Modules.PRICING)
  
  const products = await productService.listProducts(
    {},
    {
      relations: ["variants"],
      take: 5
    }
  )
  
  console.log(`\n📦 Checking ${products.length} products...\n`)
  
  for (const p of products) {
    console.log(`Product: ${p.title}`)
    for (const v of p.variants) {
      console.log(`  Variant: ${v.title} (${v.sku})`)
      
      // Query prices for this variant
      const prices = await pricingService.listPrices({
        price_set_id: v.price_set_id
      })
      
      console.log(`  Prices: ${prices.length} price(s)`)
      if (prices.length) {
        for (const price of prices) {
          console.log(`    - ${price.amount} ${price.currency_code} (region: ${price.rules_count || 0} rules)`)
        }
      }
    }
    console.log()
  }
}
