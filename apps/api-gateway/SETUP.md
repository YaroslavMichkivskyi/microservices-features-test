# API Gateway Setup & Usage

## Prerequisites

- Node.js 20+
- Docker & docker-compose (for shared PostgreSQL from monorepo root)
- Firebase project with service account credentials
- Running internal services (especially user-organization-service for gRPC calls)
- Root-level docker-compose.yml in the monorepo (fleetops/)

## 1. Environment Setup (.env)

Create .env file in apps/api-gateway/ with the following content:

PORT=3000

# Firebase Admin SDK credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# gRPC connection to user-organization-service (optional, for context enrichment)
USER_SERVICE_GRPC_URL=localhost:50051

Notes:
- FIREBASE_PRIVATE_KEY must preserve all line breaks (\n) — copy full key from Firebase Console → Project Settings → Service Accounts → Generate new private key
- Do not commit .env to git

## 2. Start Shared PostgreSQL (from monorepo root)

In the root of the project (fleetops/):

docker compose up -d

This starts:
- PostgreSQL exposed on host port 5433 (container port 5432)
- pgAdmin on http://localhost:5050 (login: admin@local.dev / password: admin)

Database name: fleetops_main  
Services use separate schemas (e.g. user_org for user-organization-service)

## 3. Install Dependencies

In apps/api-gateway/:

npm install

## 4. Run in Development Mode

npm run start:dev

After start:
- HTTP API: http://localhost:3000
- Swagger UI: http://localhost:3000/docs

## 5. Prisma & Migrations

API Gateway does not have its own database — it proxies requests to other services.  
Ensure dependent services are migrated:

cd ../user-organization-service
npx prisma generate
npx prisma migrate deploy

In production always run npx prisma migrate deploy before starting the service.

Quick commands:
- npm run lint — fix lint issues
- npm run format — format code
- npm run test — run tests
- npm run start:prod — run production build

## 7. Testing the Gateway

1. Obtain Firebase ID Token (via client SDK or Firebase Auth REST API)
2. Test protected endpoint:

curl -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
http://localhost:3000/auth/me

Expected response example:
{
"userId": "abc123",
"email": "user@example.com",
"organizationId": "org-456",
"role": "ADMIN"
}

## 8. Production Recommendations

- Store secrets in secret manager (AWS Secrets Manager, Doppler, HashiCorp Vault)
- Enable rate limiting with @nestjs/throttler
- Add helmet for security headers
- Monitoring: Prometheus + Grafana or Sentry
- Deploy via Docker + orchestration (Kubernetes, ECS, Fly.io)