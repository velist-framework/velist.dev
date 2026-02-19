# Production Build

Deploying Velist to production.

---

## Quick Deploy

```bash
# 1. Build application
bun run build

# 2. Run database migrations
bun run db:migrate

# 3. Start production server
bun src/bootstrap.ts
```

---

## AI-Powered Deployment (Recommended)

Use the DevOps Agent for automated deployment:

```
@workflow/agents/devops.md

Deploy to production.
```

The DevOps Agent will:
1. **Build application** — Verify build success
2. **Deploy to production** — Execute deployment steps
3. **Verify deployment** — Run health checks
4. **Setup monitoring** — Configure alerts
5. **Generate deployment docs** — Create deliverables

### Deliverables

DevOps Agent produces:

| File | Description |
|------|-------------|
| `DEPLOYMENT_GUIDE.md` | Step-by-step deployment instructions |
| `INFRASTRUCTURE.md` | Server & infrastructure details |
| `RELEASE_NOTES.md` | What's new in this release |

---

## Manual Deployment

### Build Command

```bash
bun run build
```

This creates:
- `dist/` — Compiled JavaScript
- `static/` — Copied assets
- `dist/manifest.json` — Asset manifest

### Environment Variables

Required in production:

```bash
NODE_ENV=production
PORT=3000
APP_VERSION=1.0.0
JWT_SECRET=your-secure-random-string
```

**Important:** Change `JWT_SECRET` to a secure random string (32+ characters).

---

## Production Checklist

### Pre-Deployment
- [ ] Build successful: `bun run build`
- [ ] Database migrated: `bun run db:migrate`
- [ ] Environment variables configured
- [ ] JWT_SECRET changed to secure value

### Deployment
- [ ] Application deployed to server
- [ ] Health check pass: `curl http://localhost:3000`
- [ ] SSL certificate active
- [ ] Domain configured correctly

### Post-Deployment
- [ ] Monitoring active
- [ ] Backup configured
- [ ] Error tracking enabled

---

## Start Production Server

### Direct

```bash
bun src/bootstrap.ts
```

### With PM2 (Recommended)

```bash
pm2 start bun --name "velist-app" -- src/bootstrap.ts
```

**PM2 Commands:**

```bash
# Check status
pm2 status

# View logs
pm2 logs velist-app

# Restart
pm2 restart velist-app

# Stop
pm2 stop velist-app

# Save config & enable startup
pm2 save
pm2 startup
```

---

## Security Headers (Helmet)

Velist menggunakan `elysia-helmet` untuk security headers di production. Security headers ini hanya aktif ketika `NODE_ENV=production`.

### Content Security Policy (CSP)

Default CSP memperbolehkan:
- **Images**: `self`, `data:`, `blob:`, `https:` (termasuk CDN)
- **Scripts**: `self`, `unsafe-inline`
- **Styles**: `self`, `unsafe-inline`
- **WebSocket**: `ws:`, `wss:` (untuk real-time features)

### Custom CDN Domain

Jika menggunakan CDN dengan domain spesifik (contoh: `https://driplab.b-cdn.net`), tambahkan ke konfigurasi helmet di `src/bootstrap.ts`:

```typescript
.use(env.NODE_ENV === 'production' 
  ? helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "https://your-cdn.com"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          mediaSrc: ["'self'", "data:", "blob:", "https:"],
        }
      }
    })
  : (a: Elysia) => a)
```

**Catatan:** Di development (`NODE_ENV=development`), helmet dan cors tidak aktif untuk memudahkan development.

---

## Database in Production

SQLite database location: `db/app.sqlite`

**Backup:**
```bash
cp db/app.sqlite db/backup-$(date +%Y%m%d).sqlite
```

**The database file should be on persistent storage.**

---

## Health Check

Test your deployment:

```bash
curl http://localhost:3000
```

Should return `200 OK` or `302 Redirect`.

---

## Monitoring

### Basic Health Check Endpoint

Velist includes a built-in health check at `GET /health`:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Log Monitoring

```bash
# View real-time logs
pm2 logs velist-app

# View last 100 lines
pm2 logs velist-app --lines 100
```

---

## Troubleshooting

### Port already in use
```bash
lsof -i :3000
kill -9 <PID>
```

### Permission denied
```bash
chmod +x db/
```

### Missing environment
```bash
cp .env.example .env
# Edit .env with production values
```

### Database locked
```bash
# Check for hanging processes
lsof db/app.sqlite

# Restart application
pm2 restart velist-app
```

---

## Zero-Downtime Deployment

For zero-downtime updates:

```bash
# 1. Build on server
bun run build

# 2. Run migrations
bun run db:migrate

# 3. Reload with PM2 (zero-downtime)
pm2 reload velist-app
```

---

## Rollback

If deployment fails:

```bash
# Restore database from backup
cp db/backup-YYYYMMDD.sqlite db/app.sqlite

# Restart with previous code
git checkout [previous-commit]
bun run build
pm2 restart velist-app
```
