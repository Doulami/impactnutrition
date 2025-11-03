# ADR-001: Medusa v2 + Next.js App Router Stack Selection

**Date:** 2025-11-03  
**Status:** Accepted  
**Deciders:** Khaled Doulami  
**Tags:** architecture, stack, headless-commerce

---

## Context

Impact Nutrition requires a modern, scalable e-commerce platform to replace the existing WooCommerce site (impactnutrition.com.tn). Key requirements include:

- **Headless architecture:** Decouple storefront from commerce backend for flexibility and performance
- **Modern developer experience:** TypeScript, strong typing, modular codebase
- **Performance targets:** Core Web Vitals compliance (LCP < 2.5s, INP < 200ms)
- **Extensibility:** Support future features (subscriptions, loyalty, B2B) without platform lock-in
- **Maintainability:** Well-documented APIs, active community, long-term viability
- **Time-to-market:** Proven solutions over custom-built frameworks

---

## Decision

We will build the Impact platform using:

1. **Commerce Backend:** Medusa v2 (Node.js/TypeScript)
2. **Database:** PostgreSQL 16
3. **Cache/Session Store:** Redis 7
4. **Storefront:** Next.js 16 App Router (React 19, TypeScript)
5. **Styling:** Tailwind CSS v4
6. **Package Manager:** pnpm

---

## Rationale

### Medusa v2
- **Headless-native:** API-first design; storefront-agnostic
- **Extensibility:** Plugin architecture for payments, shipping, notifications, loyalty
- **Data model:** Out-of-box support for multi-region, multi-currency, complex product variants
- **TypeScript-first:** Strongly typed SDK reduces integration bugs
- **Community & support:** Active Discord, comprehensive docs, SaaS option for scaling
- **Open-source:** No vendor lock-in; self-hostable

### Next.js 16 App Router
- **Performance:** Server Components, ISR, image optimization built-in
- **SEO-first:** SSR + static generation for crawlability, structured data support
- **Developer experience:** File-based routing, TypeScript, Fast Refresh, Vercel tooling
- **React 19:** Concurrent features, improved hydration, React Compiler for automatic optimization
- **Ecosystem:** Rich component libraries, analytics, monitoring integrations

### PostgreSQL + Redis
- **PostgreSQL:** ACID compliance, JSON support, mature replication/backup tools
- **Redis:** High-performance session/cart storage, pub/sub for real-time features

### Tailwind CSS v4
- **Utility-first:** Rapid prototyping, consistent design system
- **Performance:** PostCSS optimization, minimal runtime overhead
- **Dark mode:** Native support for theming

---

## Consequences

### Positive
- **Rapid development:** Medusa's pre-built commerce modules (cart, checkout, orders) accelerate Phase 1–4
- **Future-proof:** Headless architecture supports mobile app, B2B, marketplace without storefront rewrites
- **Performance by default:** Next.js SSR/ISR + CDN caching meets CWV targets
- **Type safety:** End-to-end TypeScript reduces runtime errors
- **Cloud-agnostic:** Can deploy to AWS, GCP, Vercel, Railway, or self-host

### Negative
- **Learning curve:** Team must learn Medusa v2 APIs (newer platform, less mature than Shopify/WooCommerce)
- **Plugin ecosystem:** Smaller than Shopify; may require custom integrations for Tunisia-specific payment/shipping
- **Operational complexity:** Self-hosting requires infra management (vs. SaaS like Shopify)
- **Migration effort:** No direct WooCommerce → Medusa migration tool; custom scripts required

### Neutral
- **Database management:** PostgreSQL requires backup/scaling strategy (addressed in Phase 6)
- **Medusa v2 maturity:** Released 2024; some plugins still v1-only; requires monitoring changelog

---

## Alternatives Considered

### 1. Shopify Hydrogen + Storefront API
- **Pros:** Mature platform, extensive app ecosystem, managed hosting, PCI compliance out-of-box
- **Cons:** Vendor lock-in, transaction fees, limited customization for complex promotions (SUMO replacement), Tunisia payment gateway support unclear
- **Reason for rejection:** Cost concerns (transaction fees at scale), platform lock-in limits future B2B/marketplace expansion

### 2. WooCommerce (refactor existing site)
- **Pros:** Existing catalog/customer data in place, familiar to team, mature plugin ecosystem
- **Cons:** Monolithic architecture, WordPress performance overhead, limited API-first capabilities, React integration hacky
- **Reason for rejection:** Performance targets (CWV) difficult to achieve; headless WooCommerce requires GraphQL layer (complexity similar to Medusa with worse DX)

### 3. Remix + Stripe + Custom Commerce Logic
- **Pros:** Full control, Remix performance, modern DX
- **Cons:** Build commerce primitives from scratch (cart, checkout, inventory, orders), 3–6 month dev overhead, maintenance burden
- **Reason for rejection:** Time-to-market (6–8 weeks for Phase 0–4 not feasible), reinventing solved problems

### 4. Saleor (GraphQL Commerce)
- **Pros:** Headless, open-source, GraphQL-first, Django-based
- **Cons:** Python backend (team is TypeScript-focused), smaller community than Medusa, heavier setup, GraphQL learning curve
- **Reason for rejection:** Language mismatch, Medusa's TypeScript SDK more aligned with Next.js

---

## Implementation Notes

### Phase 1 Setup
```bash
# Medusa backend
npx create-medusa-app@latest

# Next.js storefront (already initialized)
# Current setup: Next.js 16, React 19, TypeScript, Tailwind v4
```

### Package Versions (Phase 1)
- Medusa: `^2.0.0` (lock after Phase 1 verification)
- Next.js: `16.0.1` (already installed)
- PostgreSQL: `16-alpine` (Docker)
- Redis: `7-alpine` (Docker)

### Environment Strategy
- `.env.local` (local dev, gitignored)
- `.env.staging` (staging secrets, vault-managed)
- `.env.production` (prod secrets, vault-managed)

---

## Related Decisions

- ADR-002: SUMO Loyalty Migration vs. Medusa Promotions (pending Phase 2)
- ADR-003: Payment Gateway Selection (pending Phase 4)
- ADR-004: Hosting Provider Selection (pending Phase 6)

---

## References

- [Medusa v2 Docs](https://docs.medusajs.com)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Tailwind CSS v4 Alpha](https://tailwindcss.com/docs/v4-beta)
- [WooCommerce vs. Headless Commerce Comparison](https://medusajs.com/blog/woocommerce-alternative/)
