# Project Charter — Impact Nutrition E-commerce Platform

**Last Updated:** 2025-11-03  
**Status:** Active  
**Tech Lead:** Khaled Doulami

---

## Project Overview

**Impact** is a modern, headless e-commerce platform for sports nutrition, replacing the current WooCommerce site (impactnutrition.com.tn). The platform delivers a fast, goal-driven customer experience with robust commerce capabilities powered by Medusa v2 and Next.js.

---

## Scope

### In Scope (Phase 0–4, ~6–8 weeks)
- **Commerce Core:** Medusa v2 backend with PostgreSQL, Redis; product catalog, cart, checkout, orders
- **Storefront:** Next.js App Router, TypeScript, Tailwind CSS; PLP, PDP, cart, checkout flows
- **Dev Foundation:** Local Dockerized stack, environment strategy, health checks
- **Domain Modeling:** Product variants, pricing, regions, inventory, sample seed data
- **WooCommerce Migration Planning:** Data export strategy for catalog, customers, orders

### Out of Scope (Phase 0–4)
- Production hosting/deployment (deferred to Phase 6+)
- Content management (Strapi integration Phase 5+)
- Search provider integration (Phase 6)
- Customer accounts, loyalty, subscriptions (Phase 7)
- Admin ops workflows (Phase 8)

### Optional Future Tracks
- Mobile app, marketplace/multi-tenant, B2B modules, headless POS

---

## Success Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| **Conversion Rate** | ≥ 2.5% | Beta baseline → post-launch |
| **Checkout Success Rate** | ≥ 85% | Sessions reaching payment → order |
| **LCP (p75)** | < 2.5s | Lighthouse, RUM |
| **INP (p75)** | < 200ms | Lighthouse, RUM |
| **CLS (p75)** | < 0.1 | Lighthouse, RUM |
| **TTFB (p75)** | < 800ms | Lighthouse, RUM |
| **Availability** | 99.9% monthly (GA), 99.5% (beta) | Uptime monitoring |
| **Error Rate** | < 1% overall, < 0.3% checkout | Sentry |
| **PDP Indexing** | < 48h | Sitemap + structured data validation |
| **Order Sync Latency** | < 60s | Operational monitoring |
| **Stock Accuracy** | ~100% | Inventory reconciliation |

---

## Constraints

### Timeline & Resources
- **Phase 0–4 Duration:** 6–8 weeks
- **Team Size:** 1–2 developers (Khaled + optional FE collaborator)

### Technical
- **Existing Systems:** WooCommerce (impactnutrition.com.tn) with SUMO discounts/points → migration or rebuild decision required
- **Payments/Shipping:** Provider selection deferred (Stripe + local gateways considered)
- **Hosting:** Local dev only in Phase 1; cloud provider choice deferred to beta
- **Infrastructure:** Cloud-agnostic approach; IaC recommended for deployment

### Data
- **Migration Source:** Current WooCommerce catalog, customers, orders
- **SUMO Loyalty:** Migrate historical points vs. fresh start decision pending

---

## Stakeholders & RACI

| Role | Name | Responsibility |
|------|------|----------------|
| **Tech Lead** | Khaled Doulami | Architecture, development, delivery |
| **Product Owner / Client POC** | TBD | Scope approval, UAT, launch sign-off |
| **Ops / Fulfillment Lead** | TBD | Inventory, orders, shipping workflows |
| **Marketing Lead** | TBD | Content, SEO, promotions strategy |

**RACI Matrix (Phase 0–4):**
- **Tech Decisions:** Khaled = Responsible, Client POC = Informed
- **Scope Changes:** Client POC = Accountable, Khaled = Consulted
- **Data Migration:** Khaled = Responsible, Ops Lead = Consulted
- **UAT Sign-off:** Client POC = Accountable, Khaled = Responsible

---

## Deliverables (Phase 0–4)

1. **Phase 0 (✅ Complete):** Charter, risks, decisions log, ADR-001 (stack selection)
2. **Phase 1 (✅ Complete):** Local stack setup doc, .env strategy, health proof
3. **Phase 2 (✅ Documentation Complete):** Multi-tenant architecture, RBAC model, data dictionary
4. **Phase 3 (Pending):** Next.js skeleton with tenant detection, i18n (French), design tokens
5. **Phase 4 (Pending):** End-to-end commerce flow (PLP → PDP → Cart → Checkout → Order)

---

## Risks (High-Level)

See `/docs/risks.md` for detailed risk register.

**Top 3 Risks:**
1. WooCommerce data migration complexity (product variants, historical orders)
2. SUMO discount/points system migration vs. rebuild trade-offs
3. Payment/shipping provider integration timing impacts checkout delivery

---

## Approval & Sign-off

- **Phase 0 Approval:** Khaled Doulami, 2025-11-03
- **Phase 1–4 Gate:** Client POC approval required before each phase start
