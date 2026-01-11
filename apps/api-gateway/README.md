# API Gateway Service

The entry point for the MetaMarket ecosystem.

## Responsibilities
- Centralized Authentication & Authorization (via **Firebase Identity**).
- Request Routing & Payload Validation.
- Orchestration of synchronous calls (via **gRPC**) for inventory checks.
- Event publishing to **RabbitMQ** for user notifications.

## Tech Stack
- NestJS
- Firebase Admin SDK
- RabbitMQ client
- gRPC client

## Local Development
1. Create a `.env` file based on `.env.example`.
2. To use Firebase, go to Firebase Console > Project Settings > Service Accounts and generate a new private key. Fill in the `FIREBASE_*` variables.
3. Install dependencies: `npm install`.
4. Run in dev mode: `npm run start:dev`.

## API Documentation
Once running, the Swagger documentation is available at `http://localhost:3000/docs`.

## Microservices Integration
- **Orders**: Uses Kafka (Topic: `order_created`).
- **Inventory**: Uses gRPC (Proto: `libs/shared/src/proto/inventory.proto`).
- **Notifications**: Uses RabbitMQ (Queue: `notifications_queue`).
