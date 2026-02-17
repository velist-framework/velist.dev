# Docker Deployment

Deploy Velist with Docker.

---

## Quick Deploy with Docker

```bash
# Build and run
docker build -t velist-app .
docker run -d -p 3000:3000 -v $(pwd)/db:/app/db --name velist-app velist-app
```

---

## AI-Powered Deployment

Use the DevOps Agent for automated Docker deployment:

```
@workflow/agents/devops.md

Deploy to production using Docker.
```

The DevOps Agent will generate complete deployment configuration including:
- Optimized Dockerfile
- Docker Compose setup
- Health checks
- Monitoring configuration

---

## Manual Docker Setup

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Database directory
RUN mkdir -p db

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "src/bootstrap.ts"]
```

### Build Image

```bash
docker build -t velist-app .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/db:/app/db \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret-key \
  --name velist-app \
  velist-app
```

**Important:** Mount `db/` volume for persistent database.

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
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./db:/app/db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run:

```bash
docker-compose up -d
```

---

## Environment Variables

Create `.env` file:

```bash
JWT_SECRET=your-secure-random-string
```

---

## Database Persistence

The database is stored in `db/app.sqlite`. Mount this as a volume:

```yaml
volumes:
  - ./db:/app/db
```

**Without this volume, data is lost when container restarts.**

---

## Deployment Checklist

- [ ] Dockerfile optimized
- [ ] Docker Compose configured
- [ ] Environment variables set
- [ ] Database volume mounted
- [ ] Health check configured
- [ ] Container running: `docker ps`
- [ ] Health check pass: `curl http://localhost:3000/health`

---

## Useful Commands

```bash
# View logs
docker logs velist-app

# View real-time logs
docker logs -f velist-app

# Restart
docker restart velist-app

# Shell into container
docker exec -it velist-app /bin/bash

# Run migrations
docker exec velist-app bun run db:migrate

# Stop and remove
docker stop velist-app
docker rm velist-app
```

---

## Production Tips

1. **Use reverse proxy** (nginx, traefik) for SSL termination
2. **Set up log rotation** to prevent disk full
3. **Monitor container health** with `docker stats`
4. **Backup database regularly** from host volume
5. **Use specific Bun version** in Dockerfile (e.g., `oven/bun:1.0.0`)
