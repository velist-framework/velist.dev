# Deploy with Cloudflare Proxy (No Nginx)

Deploy Velist ke VPS dengan Cloudflare Proxy tanpa perlu Nginx. Cloudflare handle SSL termination dan routing langsung ke aplikasi.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────►│  Cloudflare │────►│  Velist App │
│  (HTTPS)    │     │   Proxy     │     │  (HTTP:3000)│
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  SSL/TLS    │  ← Handled by Cloudflare
                    │  Termination│     (No cert needed on VPS)
                    └─────────────┘
```

**Flow:**
1. User → Cloudflare: **HTTPS** (encrypted)
2. Cloudflare → Velist: **HTTP** port 3000 (internal)
3. Velist app tidak perlu SSL certificate

**Benefits:**
- ✅ No Nginx needed
- ✅ **No SSL certificate setup di VPS** (paling simple!)
- ✅ Automatic HTTPS dari Cloudflare
- ✅ DDoS protection
- ✅ CDN caching (static assets)
- ✅ Simpler setup

## Prerequisites

1. **Domain** - Sudah diarahkan ke Cloudflare
2. **VPS** - Dengan IP public static
3. **Velist app** - Sudah bisa jalan di port 3000

## Step 1: VPS Setup

### 1.1 Clone & Setup Project

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Clone project
git clone https://github.com/yourusername/your-velist-app.git
cd your-velist-app

# Install dependencies
bun install

# Setup environment
cp .env.example .env
nano .env
```

### 1.2 Environment Variables

```bash
# .env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-key

# Database (SQLite path)
DATABASE_URL=./db/prod.sqlite

# Backup (recommended for production)
BACKUP_ENABLED=true
BACKUP_INTERVAL_MINUTES=60
BACKUP_S3_ENABLED=true
# ... other backup config
```

### 1.3 Build & Test

```bash
# Build frontend
bun run build

# Run migrations
bun run db:migrate

# Test run
bun src/bootstrap.ts

# Should show: Server running on port 3000
# Press Ctrl+C to stop
```

## Step 2: PM2 Process Manager

Install PM2 agar app restart otomatis:

```bash
# Install PM2
bun add -g pm2

# Create PM2 config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'velist-app',
    script: './src/bootstrap.ts',
    interpreter: 'bun',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Auto restart
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Memory limit
    max_memory_restart: '500M'
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save
pm2 startup
```

## Step 3: Cloudflare Setup

### 3.1 DNS Configuration

Login ke [Cloudflare Dashboard](https://dash.cloudflare.com):

```
DNS → Records

Type: A
Name: @ (or subdomain like "app")
IPv4 address: YOUR_VPS_IP
Proxy status: Proxied (orange cloud) ✅
TTL: Auto
```

### 3.2 SSL/TLS Settings

```
SSL/TLS → Overview

Encryption mode: Flexible
```

**Pilih "Flexible"** agar:
- User ↔ Cloudflare: HTTPS (encrypted) ✅
- Cloudflare ↔ Origin (VPS): HTTP (port 3000)
- **No certificate needed di VPS** - Paling simple!

::: tip Kenapa Flexible?
Karena Velist app jalan di port 3000 tanpa SSL certificate. Flexible mode handle HTTPS di edge (Cloudflare), lalu forward HTTP ke origin.

Kalau mau Full (strict), perlu setup SSL certificate di VPS (more complex).
:::

### 3.3 Origin Rules (Port Forwarding)

```
Rules → Origin Rules → Create Rule

Rule name: Velist Port Forward

When incoming requests match:
  Field: Hostname
  Operator: equals
  Value: yourdomain.com (or subdomain)

Then:
  Destination port: 3000
```

**Tanpa Origin Rules**, Cloudflare akan connect ke port 80/443 saja.

**Dengan Origin Rules**, request diarahkan ke port 3000 di VPS.

### 3.4 Always Use HTTPS

```
SSL/TLS → Edge Certificates

Always Use HTTPS: ON
```

## Step 4: Firewall (Optional but Recommended)

### 4.1 UFW (Ubuntu/Debian)

```bash
# Install UFW
apt install ufw

# Default: deny all incoming
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (jangan lupa!)
ufw allow 22/tcp

# Allow Cloudflare IPs only (recommended)
# Cloudflare IP ranges: https://www.cloudflare.com/ips/

# IPv4
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  ufw allow from $ip to any port 3000
  ufw allow from $ip to any port 80
done

# IPv6
for ip in $(curl -s https://www.cloudflare.com/ips-v6); do
  ufw allow from $ip to any port 3000
  ufw allow from $ip to any port 80
done

# Enable UFW
ufw enable
```

**Keuntungan:** Port 3000 hanya bisa diakses dari Cloudflare, tidak dari internet langsung.

::: warning Catatan Keamanan
Dengan mode **Flexible**, traffic dari Cloudflare ke VPS (port 3000) adalah **HTTP (tidak terenkripsi)**.

Ini aman karena:
1. Cloudflare proxy menghandle HTTPS ke user
2. Internal network (VPS) biasanya trusted
3. Jika VPS di data center dengan network isolation, risk minimal

Kalau butuh **end-to-end encryption**, gunakan mode Full dengan origin certificate (lebih complex setup).
:::

## Step 5: Verify Deployment

### 5.1 Check App Running

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Or view log files
tail -f logs/out.log
```

### 5.2 Test Endpoint

```bash
# Local test
curl http://localhost:3000/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 5.3 Test from Browser

Buka: `https://yourdomain.com`

Checklist:
- [ ] HTTPS works (green lock)
- [ ] Login page muncul
- [ ] Can login/register
- [ ] Static assets load (CSS, JS)

### 5.4 Verify Cloudflare Headers

```bash
# Check if Cloudflare proxy active
curl -I https://yourdomain.com

# Should see headers:
# CF-RAY: xxx
# CF-Cache-Status: DYNAMIC
# Server: cloudflare
```

## Step 6: Update Deployment (After Code Changes)

```bash
# SSH ke VPS
ssh root@your-vps-ip
cd your-velist-app

# Pull latest
git pull

# Install new dependencies (if any)
bun install

# Build
bun run build

# Run migrations (if needed)
bun run db:migrate

# Restart PM2
pm2 restart velist-app

# Verify
pm2 logs
```

## Troubleshooting

### Error: Connection refused

```bash
# Check if app running
pm2 status

# Check port
netstat -tlnp | grep 3000

# Check firewall
ufw status
```

### Error: 521 Web Server is Down

Cloudflare tidak bisa connect ke origin:

1. Check VPS running: `pm2 status`
2. Check port 3000 listening: `netstat -tlnp | grep 3000`
3. **Check SSL/TLS mode** - Harus "Flexible", bukan "Full"
4. Check Origin Rules configured correctly
5. Check firewall allow Cloudflare IPs

### Error: 522 Connection Timed Out

1. VPS mungkin down
2. Check: `ping your-vps-ip`
3. SSH ke VPS: `ssh root@your-vps-ip`
4. Restart app: `pm2 restart all`

### Error: Invalid SSL certificate / 525 SSL Handshake Failed

**Jangan pakai Full (strict)** kalau VPS tidak punya SSL certificate.

**Solusi:**
1. Ubah ke **Flexible** mode:
   ```
   SSL/TLS → Overview → Flexible
   ```

2. Atau setup origin certificate (advanced):
   ```
   SSL/TLS → Origin Server → Create Certificate
   ```

**Rekomendasi:** Pakai Flexible untuk simplicity.

### Static assets not loading (404)

```bash
# Check if build successful
ls -la dist/

# Rebuild
bun run build

# Restart
pm2 restart velist-app
```

## Comparison: Cloudflare Proxy vs Nginx

| Aspek | Cloudflare Proxy | Nginx |
|-------|-----------------|-------|
| **Setup complexity** | Simple | More complex |
| **SSL certificate** | Auto (Cloudflare) | Manual (Let's Encrypt) |
| **DDoS protection** | ✅ Built-in | ❌ Need additional |
| **CDN caching** | ✅ Built-in | ❌ Need additional |
| **Port flexibility** | Origin Rules | Reverse proxy |
| **Rate limiting** | ✅ Cloudflare | Manual config |
| **WebSocket** | ✅ Supported | ✅ Supported |

**Recommendation:**
- Use **Cloudflare Proxy** untuk typical web app (simpler, more features)
- Use **Nginx** kalau perlu complex routing, load balancing, atau specific server configs

## Environment Variables Reference

```bash
# Production .env
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=super-secret-random-string-min-32-chars

# Database
DATABASE_URL=./db/prod.sqlite

# Storage (optional)
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./storage
LOCAL_STORAGE_URL=/storage

# Backup (recommended)
BACKUP_ENABLED=true
BACKUP_INTERVAL_MINUTES=60
BACKUP_RETENTION_COUNT=24
BACKUP_LOCAL_PATH=./storage/backups
BACKUP_S3_ENABLED=true
# ... S3 credentials

# Notifications (optional)
# Using WebSocket notifications
```

## Next Steps

- [Database Backup](./backup.md) - Setup auto-backup
- [Notifications](./notifications.md) - Enable real-time notifications
- [Monitoring](#) - Setup health checks (coming soon)
