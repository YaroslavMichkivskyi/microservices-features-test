# @fleetops/grpc-proto

Shared Protocol Buffers definitions and generated TypeScript code for gRPC communication in FleetOps.

## Purpose
This library contains .proto files and generated code for consistent inter-service interfaces (e.g., UserService for context resolution).

## How to use
1. In your service package.json, add dependency: "@fleetops/grpc-proto": "^1.0.0"
2. Import types:
   import { GetUserContextRequest, UserContextResponse } from '@fleetops/grpc-proto';

Use in gRPC clients/servers as needed.

## Development
1. Add or edit .proto files in src/proto
2. Generate code:
   npm run proto:generate:windows (on Windows) or equivalent
   Generated files appear in src/generated

3. Build library:
   npm run build
   Compiled files appear in dist — use this for production imports.

Do not edit generated files manually — regenerate after .proto changes.