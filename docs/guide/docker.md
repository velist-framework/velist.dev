# Docker Deployment

Deploy Velist with Docker. Includes multi-stage build, WAL mode support, and auto-backup.

::: warning Deployment Time
Docker deployment memiliki **downtime lebih lama** (30-70 detik) dibanding PM2 native (3-5 detik) karena proses build image. Untuk production yang memerlukan deploy cepat, pertimbangkan [PM2 Native Deployment](./production.md).
:::

---

## Quick Start

```bash
# Clone project
git clone https://github.com/yourusername/your-velist-app.git
cd your-velist-app

# Create Dockerfile dan docker-compose.yml (copy dari bawah)

# Build and run
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

---

## Dockerfile

Create `Dockerfile`:

```dockerfile
# Stage 1: Build
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN bun run build

# Stage 2: Production
FROM oven/bun:latest AS production

WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
# Note: db/ folder is mounted as volume, don't copy from builder!

# Create directories (will be overwritten by volume mount at runtime)
RUN mkdir -p /app/db /app/storage/backups

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check (using Bun built-in fetch)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start
CMD ["bun", "src/bootstrap.ts"]
```

### Build Image

```bash
docker build -t velist-app .
```

---

## Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=./db/prod.sqlite
      # Backup config
      - BACKUP_ENABLED=true
      - BACKUP_INTERVAL_MINUTES=60
      - BACKUP_RETENTION_COUNT=24
      - BACKUP_LOCAL_PATH=./storage/backups
      - BACKUP_S3_ENABLED=${BACKUP_S3_ENABLED:-false}
      # Storage config (optional)
      - STORAGE_DRIVER=${STORAGE_DRIVER:-local}
    volumes:
      # Database (WAL mode: 3 files)
      - ./db:/app/db
      # Storage (uploads, backups)
      - ./storage:/app/storage
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Environment File

Create `.env`:

```bash
# Required
JWT_SECRET=your-super-secret-random-string-min-32-chars

# Optional: S3 Backup
BACKUP_S3_ENABLED=false
# BACKUP_S3_PATH=backups/database
# S3_BUCKET=your-bucket
# S3_REGION=us-east-1
# S3_ENDPOINT=https://s3.wasabisys.com
# S3_ACCESS_KEY=xxx
# S3_SECRET_KEY=xxx

# Optional: S3 Storage
# STORAGE_DRIVER=s3
```

### Run

```bash
# First time
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check health
curl http://localhost:3000/health
```

---

## Database Persistence (WAL Mode)

Velist menggunakan **WAL mode** (Write-Ahead Logging) yang menghasilkan 3 file:

```
db/
├── prod.sqlite        # Main database
├── prod.sqlite-wal    # Write-ahead log
└── prod.sqlite-shm    # Shared memory
```

**Volume mount harus mencakup semua 3 file:**

```yaml
volumes:
  - ./db:/app/db
```

**Jangan mount file individual**, mount seluruh folder:

```yaml
# ❌ Salah - WAL files tidak tersimpan
volumes:
  - ./db.sqlite:/app/db.sqlite

# ✅ Benar - Semua file tersimpan
volumes:
  - ./db:/app/db
```

---

## Backup dalam Docker

Auto-backup berjalan di dalam container. Backup disimpan di:

```
storage/backups/
└── backup-2024-01-15T10-30-00-000Z.sqlite
```

**Volume mount untuk backup:**

```yaml
volumes:
  - ./storage:/app/storage
```

**Akses backup dari host:**

```bash
# List backups
ls -la storage/backups/

# Copy backup
mkdir -p /host/backup
cp storage/backups/backup-xxx.sqlite /host/backup/
```

---

## Production Deployment

### 1. VPS Setup

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin

# Clone project
git clone https://github.com/yourusername/your-velist-app.git
cd your-velist-app
```

### 2. Create Files

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
[paste Dockerfile from above]
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
[paste docker-compose.yml from above]
EOF

# Create .env
cat > .env << 'EOF'
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### 3. Start

```bash
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Update Deployment

```bash
# Pull latest
git pull

# Rebuild and restart
docker-compose up -d --build

# Clean old images
docker image prune -f
```

---

## Cloudflare + Docker

Kalau pakai Cloudflare Proxy dengan Docker:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"  # Cloudflare Origin Rules → 3000
    # ... rest of config
```

**Cloudflare Setup:**
1. DNS A record → VPS IP (Proxied)
2. SSL/TLS: **Flexible** (Docker tidak perlu SSL cert)
3. Origin Rules: Port 3000

Lihat detail di [Cloudflare Proxy Guide](./cloudflare-proxy.md)

---

## Reverse Proxy (Optional)

Kalau butuh multiple services atau custom routing:

```yaml
version: '3.8'

services:
  app:
    build: .
    expose:
      - "3000"
    environment:
      - PORT=3000
    volumes:
      - ./db:/app/db
      - ./storage:/app/storage
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

Tapi kalau pakai **Cloudflare Proxy**, tidak perlu Nginx!

---

## Deployment Checklist

- [ ] Dockerfile created
- [ ] docker-compose.yml created
- [ ] `.env` file dengan JWT_SECRET
- [ ] Database volume: `./db:/app/db`
- [ ] Storage volume: `./storage:/app/storage`
- [ ] Container running: `docker-compose ps`
- [ ] Health check pass: `curl http://localhost:3000/health`
- [ ] Backup folder exists: `ls storage/backups/`
- [ ] (Optional) S3 configured untuk offsite backup

---

## Update Deployment

::: danger Long Downtime Warning
Update dengan Docker memerlukan **build ulang** yang menyebabkan downtime 30-70 detik.
:::

### Standard Update (with downtime)

```bash
# 1. Backup dulu
cp -r db db-backup-$(date +%Y%m%d)

# 2. Pull latest code
git pull

# 3. Stop, rebuild, start (downtime ~30-70 detik)
docker-compose down
docker-compose up -d --build

# 4. Migration (kalau ada)
docker-compose exec app bun run db:migrate

# 5. Check status
docker-compose ps
```

**Build time breakdown:**
```
docker-compose up --build
├── Download base image:      2-5 detik
├── Install dependencies:    20-30 detik ← PALING LAMA
├── Build frontend:          10-20 detik
└── Start container:          3-5 detik
TOTAL: ~35-60 detik downtime
```

### Faster Update dengan Pre-built Image

Push image ke registry (Docker Hub, GHCR, etc), lalu pull di VPS:

```bash
# Di CI/CD atau local development
docker build -t yourname/velist-app:v2.0 .
docker push yourname/velist-app:v2.0

# Di VPS (hanya pull, tidak perlu build)
docker-compose down
docker pull yourname/velist-app:v2.0  # 5-10 detik
docker-compose up -d                  # 3 detik
# Total downtime: ~10-15 detik
```

**docker-compose.yml untuk pre-built:**
```yaml
services:
  app:
    image: yourname/velist-app:v2.0  # ← Pre-built image
    # build: .  # ← Comment out
    ports:
      - "3000:3000"
    # ... rest of config
```

---

## Docker vs PM2 Comparison

| Aspek | Docker | PM2 Native |
|-------|--------|------------|
| **Setup complexity** | Medium | Simple |
| **Deployment time** | ⚠️ 30-70 detik | ✅ 3-5 detik |
| **Downtime** | ⚠️ Long (build) | ✅ Short (restart) |
| **Isolation** | ✅ Containerized | ❌ Process only |
| **Portability** | ✅ Run anywhere | ⚠️ Need Bun installed |
| **Multi-service** | ✅ Easy with Compose | ❌ Manual setup |
| **SQLite support** | ✅ Volume mount | ✅ Native file |

### When to Use Docker

✅ **Cocok untuk:**
- Development environment consistency
- Multi-service apps (app + redis + etc)
- Kubernetes deployment
- CI/CD pipeline dengan registry
- Teams yang familiar Docker

### When to Use PM2 Native

✅ **Cocok untuk:**
- Production deployment cepat
- Single VPS sederhana
- SQLite-only apps
- Low traffic websites
- Quick iteration/development

### Recommendation by Scenario

| Scenario | Recommended | Why |
|----------|-------------|-----|
| Startup/Side project | **PM2** | Deploy cepat, simple |
| Production app | **PM2** atau **Docker + Registry** | Minimal downtime |
| Multi-service | **Docker** | Compose orchestration |
| Kubernetes | **Docker** | Container standard |
| Team dev | **Docker** | Consistent environment |

---

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Shell into container
docker-compose exec app /bin/bash

# Run migrations manually
docker-compose exec app bun run db:migrate

# Backup database manually
docker-compose exec app bun -e "
  const { backupService } = require('./src/features/backup/service');
  backupService.performBackup().then(console.log);
"

# View running containers
docker ps

# Stop
docker-compose down

# Stop and remove volumes (DANGER - data lost!)
docker-compose down -v
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Common issues:
# 1. JWT_SECRET not set
# 2. Port 3000 already in use
# 3. Permission denied on volumes
```

### Database locked or WAL errors

```bash
# WAL files mungkin corrupt
# Fix: Delete WAL files (data terakhir mungkin hilang)
docker-compose down
rm db/*.sqlite-wal db/*.sqlite-shm
docker-compose up -d
```

### Backup not running

```bash
# Check backup service logs
docker-compose logs | grep "\[Backup\]"

# Check if BACKUP_ENABLED=true
docker-compose exec app env | grep BACKUP
```

### Permission denied on volumes

```bash
# Fix permissions
sudo chown -R 1000:1000 db/ storage/
```

---

## See Also

- [Cloudflare Proxy](./cloudflare-proxy.md) - Deploy tanpa Nginx
- [Backup](./backup.md) - Auto-backup configuration
- [Production](./production.md) - Native VPS deployment (non-Docker)
