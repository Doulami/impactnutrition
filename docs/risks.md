# Risk Register — Impact Nutrition Platform

**Last Updated:** 2025-11-03  
**Owner:** Khaled Doulami

---

## Risk Assessment Matrix

| ID | Risk | Impact | Probability | Severity | Mitigation | Owner |
|----|------|--------|-------------|----------|------------|-------|
| R-001 | WooCommerce data migration complexity (product variants, custom fields, order history) | High | High | **Critical** | Phase 2: audit WooCommerce schema, define mapping strategy, build migration scripts with validation; dry-run on staging | Khaled |
| R-002 | SUMO discount/points system migration vs. rebuild decision | Medium | Medium | **High** | Phase 2: analyze SUMO rules complexity, cost-benefit of migration vs. Medusa-native promotions; document decision in ADR-002 | Khaled + Client POC |
| R-003 | Payment gateway integration timing (Stripe + local providers) | Medium | Medium | **High** | Phase 4: prioritize Stripe first (test mode), defer local gateways to Phase 5+ if needed; maintain fallback manual payment option | Khaled |
| R-004 | Shipping provider selection and zone configuration | Medium | Low | **Medium** | Phase 2: define regions/zones with ops lead; Phase 4: integrate test shipping rates; finalize provider in Phase 5 | Khaled + Ops Lead |
| R-005 | Hosting/infrastructure choice deferred until beta | Low | Medium | **Medium** | Phase 1: build cloud-agnostic (Docker, env vars); Phase 6: evaluate AWS/GCP/Vercel based on budget/scale; document IaC requirements | Khaled |
| R-006 | Resource availability (1–2 devs, 6–8 week timeline) | Medium | Medium | **High** | Strict phase gating; descope non-critical features to Phase 5+; prioritize Phases 1–4 (foundations + checkout) | Khaled |
| R-007 | Medusa v2 API breaking changes (new platform) | Low | Low | **Medium** | Lock Medusa version in package.json; subscribe to Medusa changelog; test upgrades in isolated branch | Khaled |
| R-008 | Performance regression (CWV targets not met) | Medium | Low | **Medium** | Phase 6: establish perf budget, Lighthouse CI; optimize images, SSR/ISR strategy, CDN caching | Khaled |
| R-009 | SEO migration risk (URL structure, redirects, indexing) | High | Medium | **High** | Phase 3: map WooCommerce URLs to new routes; Phase 6: generate sitemap, 301 redirects, structured data; monitor GSC post-launch | Khaled + Marketing |
| R-010 | Scope creep (client requests during Phases 1–4) | Medium | Medium | **High** | Enforce phase gate approvals; log all requests in backlog for Phase 5+; communicate trade-offs clearly | Khaled + Client POC |

---

## Risk Categories

### **Technical Risks**
- **R-001:** Data migration complexity
- **R-007:** Medusa v2 breaking changes
- **R-008:** Performance targets not met

### **Integration Risks**
- **R-003:** Payment gateway timing
- **R-004:** Shipping provider selection
- **R-002:** SUMO loyalty system

### **Timeline/Resource Risks**
- **R-006:** Limited dev capacity
- **R-010:** Scope creep

### **Operational Risks**
- **R-005:** Hosting decision deferred
- **R-009:** SEO migration impact

---

## Mitigation Actions (Immediate)

1. **Phase 1 (Week 1–2):** Audit WooCommerce database schema, export sample products/orders for analysis
2. **Phase 2 (Week 2–3):** Document SUMO discount rules, create decision matrix (migrate vs. rebuild)
3. **Phase 3 (Week 3–4):** Map current WooCommerce URL structure to Next.js routes for 301 plan
4. **Phase 4 (Week 5–6):** Integrate Stripe test mode; defer non-critical payment methods to Phase 5+

---

## Escalation Criteria

- **Critical risks (R-001, R-010):** Escalate to Client POC if mitigation fails or new blockers arise
- **High risks (R-002, R-003, R-006, R-009):** Weekly review in status updates; escalate if probability increases
- **Medium/Low risks:** Monitor quarterly; update mitigation as needed

---

## Change Log

| Date | Change | Updated By |
|------|--------|------------|
| 2025-11-03 | Initial risk register created | Khaled Doulami |
