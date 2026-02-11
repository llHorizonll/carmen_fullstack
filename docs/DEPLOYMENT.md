# Carmen Deployment Guide

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- .NET 8.0 SDK (for manual deployment)
- Node.js 18+ and npm (for manual frontend build)
- MySQL 8.0+ (if not using Docker)
- Redis 7+ (if not using Docker)

## Quick Start (Docker Compose)

### 1. Clone and configure

```bash
git clone <repo-url> carmen
cd carmen
cp .env.example .env
```

Edit `.env` and set production values:
- `MYSQL_ROOT_PASSWORD` — strong root password
- `MYSQL_PASSWORD` — application database password
- `JWT_SECRET` — 32+ character secret for JWT signing
- `CORS_ORIGINS` — your production frontend URL

### 2. Build and start

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### 3. Verify

```bash
# Health check
curl http://localhost:5000/health

# Run smoke tests
bash scripts/smoke-test.sh
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | (required) |
| `MYSQL_PASSWORD` | Application DB password | (required) |
| `JWT_SECRET` | JWT signing key (32+ chars) | (required) |
| `JSREPORT_PASSWORD` | jsreport admin password | `JsReport@123` |
| `ASPNETCORE_ENVIRONMENT` | .NET environment | `Production` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server hostname | (optional) |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | (optional) |
| `SMTP_PASSWORD` | SMTP password | (optional) |

## Database Migrations

EF Core migrations run automatically on startup in Development mode. For production:

```bash
# Generate SQL script from migrations
cd backend
dotnet ef script --project src/Carmen.Database --idempotent -o migration.sql

# Review and apply
mysql -u carmen_user -p Carmen < migration.sql
```

Or apply directly:

```bash
dotnet ef database update --project src/Carmen.Database
```

## SSL/HTTPS Setup

### Option 1: Reverse Proxy (Recommended)

Place nginx or Caddy in front of the Docker stack:

```nginx
server {
    listen 443 ssl http2;
    server_name carmen.example.com;

    ssl_certificate /etc/letsencrypt/live/carmen.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/carmen.example.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SignalR
    location /hubs {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name carmen.example.com;
    return 301 https://$host$request_uri;
}
```

### Option 2: Let's Encrypt with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d carmen.example.com
```

## Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Basic health status |
| `GET /health/ready` | Readiness probe (for k8s) |
| `GET /health/live` | Liveness probe (for k8s) |
| `GET /` | API info (name, version, status) |

## Monitoring

### Application Logs

Backend uses Serilog with structured logging:

```bash
# View backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# View all logs
docker compose -f docker-compose.prod.yml logs -f
```

Log files are written to `logs/` directory inside the container. Mount a volume to persist:

```yaml
volumes:
  - ./logs:/app/logs
```

### Hangfire Dashboard

Background job monitoring is available at `/hangfire` (requires authentication).

## Backup Procedures

### MySQL Backup

```bash
# Backup
docker exec carmen-mysql mysqldump -u root -p Carmen > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i carmen-mysql mysql -u root -p Carmen < backup_20240101.sql
```

### Automated Daily Backup

Add to crontab:

```bash
0 2 * * * docker exec carmen-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} Carmen | gzip > /backups/carmen_$(date +\%Y\%m\%d).sql.gz
```

### Redis Backup

Redis data is persisted in the `redis-data` volume with AOF enabled. For manual backup:

```bash
docker exec carmen-redis redis-cli BGSAVE
docker cp carmen-redis:/data/dump.rdb ./redis-backup.rdb
```

## Troubleshooting

### Backend won't start
- Check MySQL is healthy: `docker exec carmen-mysql mysqladmin ping -h localhost`
- Check connection string: verify `MYSQL_PASSWORD` matches between MySQL and backend
- Check logs: `docker compose -f docker-compose.prod.yml logs backend`

### Frontend returns 502
- Verify backend is running: `curl http://localhost:5000/health`
- Check nginx proxy config points to correct backend URL

### Database migration errors
- Check EF Core migrations are up to date
- Verify database user has ALTER, CREATE, DROP permissions
- Review migration SQL: `dotnet ef script --idempotent`

### Redis connection refused
- Check Redis is healthy: `docker exec carmen-redis redis-cli ping`
- Verify Redis connection string in backend environment

### JWT authentication failures
- Ensure `JWT_SECRET` is the same across all backend instances
- Check token expiry (`ExpiryMinutes` in config, default 480 = 8 hours)
- Verify `Issuer` and `Audience` match between token generation and validation
