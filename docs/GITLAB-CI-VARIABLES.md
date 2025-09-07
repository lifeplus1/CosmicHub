# GitLab CI/CD Variables Configuration Template

Copy this content and configure these variables in GitLab: **Project Settings > CI/CD > Variables**

## Deployment Credentials

### Vercel (Frontend Deployment)

```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here  
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

### Render (Backend Deployment)

```bash
RENDER_SERVICE_ID=your_render_service_id_here
RENDER_API_KEY=your_render_api_key_here
```

### Docker Registry (if using GitLab Registry)

```bash
CI_REGISTRY_USER=$CI_REGISTRY_USER  # Use GitLab's built-in variable
CI_REGISTRY_PASSWORD=$CI_REGISTRY_PASSWORD  # Use GitLab's built-in variable
CI_REGISTRY_IMAGE=$CI_REGISTRY_IMAGE  # Use GitLab's built-in variable
```

## Firebase Configuration

### Firebase Service Account (Backend)

```bash
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key  # Mark as Protected & Masked
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_cert_url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
FIREBASE_CREDENTIALS=your_complete_firebase_credentials_json  # Mark as Protected & Masked
```

### Firebase Frontend Configuration

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Application Configuration

### API Configuration

```bash
API_KEY=your_secure_api_key_here  # Mark as Protected & Masked
VITE_BACKEND_URL=https://astrology-app-0emh.onrender.com
```

### Application Settings

```bash
LOG_FILE=logs/app.log
PORT=8000
EPHE_PATH=/app/ephe
```

## Security & Monitoring

### Security Scanning

```bash
SECURE_ANALYZERS_PREFIX=registry.gitlab.com/security-products/analyzers
```

### Performance Monitoring (Optional)

```bash
SITESPEED_BUDGET_PATH=.sitespeed-budget.json
```

### Notification Webhooks (Optional)

```bash
SLACK_WEBHOOK_URL=your_slack_webhook_url  # Mark as Protected & Masked
DISCORD_WEBHOOK_URL=your_discord_webhook_url  # Mark as Protected & Masked
```

## Environment-Specific Overrides

### Staging Environment

```bash
STAGING_VERCEL_PROJECT_ID=your_staging_vercel_project_id
STAGING_RENDER_SERVICE_ID=your_staging_render_service_id
STAGING_VITE_BACKEND_URL=https://astrology-app-staging.onrender.com
```

### Production Environment

```bash
PRODUCTION_VERCEL_PROJECT_ID=your_production_vercel_project_id
PRODUCTION_RENDER_SERVICE_ID=your_production_render_service_id
PRODUCTION_VITE_BACKEND_URL=https://astrology-app-0emh.onrender.com
```

## Variable Configuration Notes

### Variable Types in GitLab

- **Variable**: Standard environment variable
- **File**: Creates a file with the variable content (useful for certificates)
- **Protected**: Only available to protected branches (main, production)
- **Masked**: Value is hidden in job logs (use for secrets)

### Recommended Settings

- **All credentials**: Protected = true, Masked = true
- **API keys**: Protected = true, Masked = true  
- **Public configuration**: Protected = false, Masked = false
- **Firebase private key**: Type = File, Protected = true, Masked = true

## Validation Commands

### Test your variables locally

```bash
export $(cat .env.ci | xargs) && pnpm run ci:validate
```

### Validate Firebase credentials

```bash
firebase projects:list --token $FIREBASE_TOKEN
```

### Validate Vercel deployment

```bash
vercel deploy --dry-run --token $VERCEL_TOKEN
```

### Validate Render deployment

```bash
curl -H "Authorization: Bearer $RENDER_API_KEY" https://api.render.com/v1/services/$RENDER_SERVICE_ID
```
