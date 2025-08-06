# CosmicHub Monorepo

## Structure

- frontend/
  - astro
  - healwave
- backend/
- shared/
- assets/
- logs/
- docs/
- typings/

## Scripts

Use the Makefile for common tasks:
- `make test` — run all tests
- `make lint` — run all linters
- `make build` — build all frontends
- `make format` — format frontend code

## Environment Variables
See `docs/ENVIRONMENT.md` for all required secrets and environment variables.

## CI/CD
Use `.gitlab-ci.yml` for GitLab or `.github/workflows/ci.yml` for GitHub Actions. Only one should be active.
