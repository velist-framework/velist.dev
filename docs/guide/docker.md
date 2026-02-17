# Docker Deployment

Deploy Velist with Docker.

---

## Dockerfile

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

---

## Build Image

```bash
docker build -t velist-app .
```

---

## Run Container

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
      - VITE_URL=${VITE_URL:-http://localhost:3000}
    volumes:
      - ./db:/app/db
    restart: unless-stopped
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
VITE_URL=https://your-domain.com
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

## Useful Commands

```bash
# View logs
docker logs velist-app

# Restart
docker restart velist-app

# Shell into container
docker exec -it velist-app /bin/bash

# Stop and remove
docker stop velist-app
docker rm velist-app
```

---

## Production Tips

1. Use reverse proxy (nginx, traefik) for SSL
2. Set up log rotation
3. Monitor container health
4. Backup database regularly
