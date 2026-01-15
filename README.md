# FleetOps

FleetOps is a workforce and operations management platform designed for companies that manage distributed teams and physical operations such as logistics, field service, construction, maintenance, or equipment rental.

The platform focuses on task planning, execution tracking, reporting, and compliance. IoT integration is optional and serves only as an enrichment layer, not as the core of the system.

---

## Key goals of app as a pet project

- Demonstrate clean microservice boundaries
- **Strict B2B multi-tenancy**: One user belongs to exactly one organization
- Show real-world usage of multiple databases
- Apply event-driven and streaming patterns (Kafka & RabbitMQ)
- Use cloud-native concepts (AWS Lambda, S3)
- Provide pragmatic, maintainable architecture

---

## Users and roles

FleetOps uses a strict organization-level scoping. A user account is tied to a single organization.

### OWNER
- High-level control: Can manage organization settings and billing.
- User management: Can create **ADMIN** and **USER** accounts for the staff.
- Full access to all organizational data and analytics.

### ADMIN
- Operational management: Define teams, task templates, and workflows.
- Staff management: Create **USER** accounts and assign them to teams.
- Access to dashboards and reporting.

### USER (Field Worker / Technician)
- Execution: View assigned tasks and update statuses.
- Evidence: Upload photos, documents, and reports.
- Notifications: Receive alerts regarding tasks and deadlines.

---

## Typical user flow

1. **Owner Registration**: A user registers a new organization. The system creates the `Organization` record and the first `User` with the `OWNER` role.
2. **Onboarding**: The Owner (or Admin) creates accounts for employees by email. The system uses Firebase Admin SDK to provision accounts.
3. **Setup**: Admins define teams and task templates.
4. **Execution**: Tasks are created and assigned. Users update task progress in the field.
5. **Enrichment**: Optional IoT or external signals update task data via the Telemetry service.
6. **Reporting**: Admins/Owners review aggregated stats provided by the Analytics service.

---

## Architecture overview

NestJS monorepo with focused services + one Go-based service for high-throughput ingestion.  
Services are split by data ownership and scalability requirements.

### Services

#### API Gateway (NestJS)
- Single entry point for clients (REST).
- **Context Resolution**: Resolves `userId`, `orgId`, and `role` via gRPC from the User Service.
- Request validation, rate limiting, and S3 pre-signed URL generation.

#### User & Organization Service (PostgreSQL + Prisma)
- Source of truth for identity and company structure.
- Handles Organizations, Users, and Teams.
- **Provisioning**: Wraps Firebase Admin SDK to create/invite staff accounts.
- Provides gRPC interface for fast context lookups.

#### Task & Workflow Service (MySQL + TypeORM)
- Manages tasks, templates, and state machine transitions.
- All data is strictly filtered by `organization_id`.
- Publishes task lifecycle events to Kafka and notification triggers to RabbitMQ.

#### Notification Service (NestJS + PostgreSQL)
- **Role**: Event-driven worker for delivering Push (FCM) and Email (SES).
- Consumes from RabbitMQ (instant business events) and Kafka (analytical alerts).
- Manages user notification preferences and "In-app Inbox" history.

#### Analytics Service (NestJS + Kafka + PostgreSQL)
- Consumes Kafka events to build aggregated read models.
- **Statistics**: Owns calculations like "tasks completed per day" or "average completion time."
- Uses time-based partitioning for historical data.

#### Telemetry Integration Service (Go)
- High-throughput ingestion of IoT / third-party signals.
- Normalizes and publishes enrichment events to Kafka.

---

## Messaging and streaming

- **Kafka**: Critical task lifecycle events, analytics pipelines, and cross-service enrichment.
- **RabbitMQ**: Non-critical notifications (push/email), retries, and delayed background jobs.

---

## Database schemas

### User & Organization Service (PostgreSQL)

**organizations**
- id (uuid, pk)
- name (varchar)
- status (active | suspended)
- created_at (timestamp)

**users**
- id (uuid, pk)
- firebase_uid (varchar, unique)
- email (varchar, unique)
- organization_id (fk -> organizations.id)
- role (OWNER | ADMIN | USER)
- display_name (varchar)
- created_at (timestamp)

**teams**
- id (uuid, pk)
- organization_id (fk -> organizations.id)
- name (varchar)

**team_members**
- team_id (fk -> teams.id)
- user_id (fk -> users.id)

### Task & Workflow Service (MySQL)

**tasks**
- id (char(36), pk)
- organization_id (char(36), index)
- assigned_team_id (char(36), nullable)
- assigned_user_id (char(36), nullable)
- status (CREATED | IN_PROGRESS | COMPLETED | CANCELLED)
- priority (LOW | MEDIUM | HIGH)
- due_date (datetime)

**task_events** (audit log)
- id (bigint, pk)
- task_id (char(36))
- event_type (STATUS_CHANGED | COMMENT | ATTACHMENT_ADDED)
- payload (json)

### Notification Service (PostgreSQL)

**user_notification_settings**
- user_id (uuid, pk)
- email_enabled (boolean)
- push_enabled (boolean)
- marketing_emails (boolean)

**notification_logs** (In-app Inbox)
- id (uuid, pk)
- user_id (uuid, index)
- title (varchar)
- body (text)
- read_at (timestamp, nullable)
- created_at (timestamp)

---

## Architecture diagram



```mermaid
graph TD
    Client[Web / Mobile Client] -->|REST| APIGW[API Gateway]

    subgraph "Identity & Access"
        APIGW -->|gRPC| UserSvc[User & Org Service]
        UserSvc --> Firebase[Firebase Auth]
        UserSvc --> Postgres[(PostgreSQL)]
    end

    subgraph "Business Logic"
        APIGW --> TaskSvc[Task Service]
        TaskSvc --> MySQL[(MySQL)]
        TaskSvc -->|Events| Kafka[(Kafka)]
        TaskSvc -->|Commands| RabbitMQ[(RabbitMQ)]
    end

    subgraph "Processing & Insights"
        Kafka --> AnalyticsSvc[Analytics Service]
        AnalyticsSvc --> AnalyticsDB[(PostgreSQL)]
        Kafka --> TelemetrySvc[Telemetry Service - Go]
        
        RabbitMQ --> NotificationSvc[Notification Service]
        NotificationSvc --> NotificationDB[(PostgreSQL)]
        NotificationSvc --> FCM[Firebase Cloud Messaging]
        NotificationSvc --> SES[Amazon SES]
    end

    APIGW -->|Presigned URL| S3[(Amazon S3)]
    S3 --> Lambda[AWS Lambda]