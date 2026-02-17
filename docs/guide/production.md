# Production Build

Deploying Velist to production.

---

## Build Command

```bash
bun run build
```

This creates:
- `dist/` — Compiled JavaScript
- `static/` — Copied assets
- `dist/manifest.json` — Asset manifest

---

## Environment Variables

Required in production:

```bash
NODE_ENV=production
PORT=3000
APP_VERSION=1.0.0
JWT_SECRET=your-secure-random-string
VITE_URL=https://your-domain.com
```

**Important:** Change `JWT_SECRET` to a secure random string (32+ characters).

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Change `JWT_SECRET` to secure value
- [ ] Build assets: `bun run build`
- [ ] Run migrations: `bun run db:migrate`
- [ ] Set correct `VITE_URL`

---

## Start Production Server

```bash
bun src/bootstrap.ts
```

Or with PM2:

```bash
pm2 start bun --name "velist-app" -- src/bootstrap.ts
```

---

## PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs velist-app

# Restart
pm2 restart velist-app

# Stop
pm2 stop velist-app

# Save config
pm2 save
pm2 startup
```

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
