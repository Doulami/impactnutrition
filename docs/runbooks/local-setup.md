# Local Development Setup

**Last Updated:** 2025-11-03  
**Phase:** 1 — Dev Foundation

---

## Prerequisites

- **Node.js:** v20+ (LTS recommended)
- **pnpm:** v9+ (`npm install -g pnpm`)
- **Docker:** v24+ with Docker Compose v2
- **PostgreSQL Client:** `psql` (optional, for DB inspection)

---

## Quick Start

### 1. Start Development Services

```bash
# Start PostgreSQL + Redis
cd dev-services
sudo docker compose --env-file .env.db up -d

# Verify containers are healthy
sudo docker compose ps
```

**Expected output:**
```
NAME              STATUS
impact-postgres   Up (healthy)
impact-redis      Up (healthy)
```

### 2. Start Medusa Backend

```bash
cd backend
npm run dev
```

**API will be available at:**
- **Health:** http://localhost:9000/health
- **Admin:** http://localhost:9000/app
- **Store API:** http://localhost:9000/store

**Default admin credentials:**
- Email: `admin@medusa-test.com`
- Password: Set during first admin invite flow

### 3. Start Next.js Storefront

```bash
# From project root
pnpm dev
```

**Storefront available at:** http://localhost:3000

---

## Project Structure

```
/home/dmiku/dev/impactnutrition/
├── backend/              # Medusa v2 commerce API
│   ├── src/             # Custom modules, workflows, API routes
│   ├── medusa-config.ts # Medusa configuration
│   └── .env             # Backend environment variables
├── backend-storefront/   # Generated Next.js starter (can be removed)
├── src/                 # Main Next.js storefront (App Router)
│   └── app/            # Next.js routes and layouts
├── dev-services/        # Docker Compose for local DB/Redis
│   ├── docker-compose.yml
│   └── .env.db         # Database credentials
├── docs/                # Project documentation
│   ├── charter.md
│   ├── risks.md
│   └── decisions/      # Architecture Decision Records
└── public/             # Static assets
```

---

## Database Access

### Connect to PostgreSQL

```bash
# Using psql
psql postgres://medusa:medusa@localhost:5432/medusa_dev

# Or via Docker
sudo docker exec -it impact-postgres psql -U medusa -d medusa_dev
```

### Common DB Commands

```sql
-- List tables
\dt

-- View products
SELECT id, title, status FROM product;

-- View orders
SELECT id, email, status, total FROM "order";

-- Exit
\q
```

---

## Redis Access

```bash
# Connect to Redis CLI
sudo docker exec -it impact-redis redis-cli

# Check keys
KEYS *

# Get session data
GET sess:your_session_id
```

---

## Environment Variables

### Backend (`/backend/.env`)

**Current configuration:**
```bash
# Database
DATABASE_URL=postgres://medusa:medusa@localhost:5432/medusa_dev

# Redis
REDIS_URL=redis://localhost:6379

# Security (change in production!)
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret

# CORS (adjust for your storefront)
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000,http://localhost:3000

# Admin onboarding
MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=backend-storefront
```

**⚠️ Security Notes:**
- `JWT_SECRET` and `COOKIE_SECRET` MUST be changed for staging/prod
- Use `openssl rand -base64 32` to generate secure secrets
- Never commit `.env` files to git

### Storefront (`/.env.local`)

**To be created in Phase 3:**
```bash
# Medusa API URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Publishable API key (from Medusa admin)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

---

## Stopping Services

```bash
# Stop Medusa backend (Ctrl+C in terminal)

# Stop Next.js storefront (Ctrl+C in terminal)

# Stop Docker services
cd dev-services
sudo docker compose down
```

---

## Troubleshooting

### Issue: "Cannot connect to PostgreSQL"

**Check container status:**
```bash
sudo docker compose -f dev-services/docker-compose.yml ps
```

**View logs:**
```bash
sudo docker compose -f dev-services/docker-compose.yml logs db
```

**Restart services:**
```bash
sudo docker compose -f dev-services/docker-compose.yml restart db
```

### Issue: "Redis connection failed"

**Check Redis container:**
```bash
sudo docker compose -f dev-services/docker-compose.yml logs redis
```

**Test connection:**
```bash
sudo docker exec -it impact-redis redis-cli ping
# Should return: PONG
```

### Issue: "Port 9000 already in use"

**Find process using port:**
```bash
sudo lsof -i :9000
```

**Kill process:**
```bash
kill -9 <PID>
```

### Issue: "Database migration failed"

**Reset database (⚠️ deletes all data):**
```bash
cd backend
npm run db:reset
npm run db:migrate
npm run seed
```

---

## Docker Group Access (Optional)

**To run docker commands without `sudo`:**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker

# Test (should work without sudo)
docker ps
```

---

## Next Steps

- **Phase 2:** Domain modeling, product schema, seed data strategy
- **Phase 3:** Connect Next.js storefront to Medusa API
- **Phase 4:** Implement cart, checkout, payment flows

---

## Health Check Verification

**Run this to verify setup:**

```bash
# Check Postgres
sudo docker exec impact-postgres pg_isready -U medusa

# Check Redis
sudo docker exec impact-redis redis-cli ping

# Check Medusa API (requires backend running)
curl http://localhost:9000/health

# Expected: {"status":"ok"}
```

---

## Support Resources

- **Medusa Docs:** https://docs.medusajs.com
- **Medusa Discord:** https://discord.gg/medusajs
- **Next.js Docs:** https://nextjs.org/docs
- **Project Docs:** `/docs/charter.md`, `/docs/risks.md`
