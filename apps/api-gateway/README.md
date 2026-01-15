# API Gateway Service

The **API Gateway** is the single entry point for all FleetOps client applications (Web and Mobile). It acts as a transparent proxy and orchestrator, handling cross-cutting concerns such as authentication, authorization, request validation, and service routing.

---

## Responsibilities

- **Authentication**: Validates Firebase JWT tokens.
- **Context Resolution**: Enriches every request with `userId`, `orgId`, and `role` via high-speed gRPC calls.
- **Authorization**: Enforces Role-Based Access Control (RBAC) and Organization-level scoping.
- **Orchestration**: Aggregates data from multiple services where necessary.
- **Security**: Implements rate limiting, CORS, and header sanitization.
- **Documentation**: Serves the global Swagger/OpenAPI documentation.
- **Cloud Integration**: Generates S3 pre-signed URLs for direct evidence uploads.

---

## Tech Stack & Communication

- **Framework**: NestJS
- **Identity Provider**: Firebase Auth (Admin SDK)
- **Inter-Service Comm (Identity)**: gRPC (Client) to User & Org Service.
- **Inter-Service Comm (Business)**: HTTP/REST to Task and Analytics Services.
- **Documentation**: Swagger UI
- **Storage Integration**: AWS SDK (S3)

---

## Architecture Logic & Flow



1. **Request Intake**: Client sends a REST request with a `Bearer` token.
2. **Auth Guard**: `FirebaseStrategy` verifies the token validity against Firebase.
3. **Context Enrichment**: The Gateway uses the `firebase_uid` to call the **User & Org Service** via **gRPC**. It retrieves the user's `orgId` and `role`.
4. **Scoping**: The resolved context is injected into the request object.
5. **Routing**: The request is proxied to the appropriate downstream service (Task, Analytics, or Telemetry).

---

## Internal Modules

### 1. `AuthModule`
Wraps the Firebase Admin SDK and Passport.js strategy. It handles the initial handshake and token extraction.

### 2. `UserContextModule` (gRPC Client)
Contains the gRPC client implementation. It connects to the `User & Org Service` using the shared `@fleetops/grpc-proto` definitions. This ensures type-safe communication for identity resolution.

### 3. `ProxyModule`
Responsible for forwarding requests to downstream microservices. It automatically appends the `X-Organization-Id` and `X-User-Role` headers to internal requests so downstream services can filter data without re-authenticating.

### 4. `StorageModule`
Interacts with **Amazon S3**. It provides endpoints for users to request pre-signed URLs, allowing clients to upload task evidence directly to the cloud, bypassing the gateway's bandwidth.

---

## Security & Scoping Rules

As a **Strict B2B** system, the Gateway enforces the following:
- **Global Filter**: Any request to Task or Analytics services without a valid `orgId` (resolved from User Service) is rejected with `403 Forbidden`.
- **Role Guards**:
    - `@Roles(Role.OWNER)`: Access to billing and organization deactivation.
    - `@Roles(Role.ADMIN)`: Access to team management and staff onboarding.
    - `@Roles(Role.USER)`: Access to task execution and personal reporting.

---

## Core API Groups

| Group | Target Service | Logic Type |
| :--- | :--- | :--- |
| `/auth` | Gateway / Firebase | Login, Token Refresh, Me |
| `/organizations` | User & Org Service | CRUD (Owner Only) |
| `/users` | User & Org Service | Staff Onboarding (Firebase Provisioning) |
| `/teams` | User & Org Service | Team structuring |
| `/tasks` | Task Service | Planning and Execution |
| `/analytics` | Analytics Service | Dashboards and Materialized Stats |
| `/attachments` | Gateway (S3) | Pre-signed URL generation |

---

## Inter-Service Connectivity Summary

- **User & Org Service**: Connected via **gRPC** on port `50051`. Used for every authenticated request.
- **Task Service**: Connected via **Internal REST** (ClusterIP). Used for business logic.
- **Analytics Service**: Connected via **Internal REST**. Used for dashboard data.
- **S3**: Connected via **AWS SDK**. Used for secure file uploads.

---