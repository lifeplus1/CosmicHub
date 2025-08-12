# CosmicHub Docker Commands Reference

## Build all containers
```bash
API_KEY=c3a579e58484f1eb21bfc96966df9a25 docker-compose build
```

## Start all containers
```bash
API_KEY=c3a579e58484f1eb21bfc96966df9a25 docker-compose up -d
```

## Stop all containers
```bash
docker-compose down
```

## View container status
```bash
docker-compose ps
```

## View logs
```bash
docker-compose logs [service-name]
```

## Rebuild and restart a specific service
```bash
docker-compose build [service-name]
docker-compose restart [service-name]
```

## Access points
- **Backend API**: http://localhost:8000
- **Ephemeris Server**: http://localhost:8001
- **Astro App**: http://localhost:3000
- **HealWave App**: http://localhost:4000
- **Redis**: localhost:6379

## Health checks
- Backend: `curl http://localhost:8000/health`
- Ephemeris: `curl http://localhost:8001/health`
- Test script: `python3 test_backend.py`

## Environment variables
- API_KEY: Required for ephemeris server authentication
- ALLOWED_ORIGINS: CORS configuration for frontend access
