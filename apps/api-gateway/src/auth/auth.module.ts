import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './strategies/firebase.strategy';
import { FirebaseModule } from '../firebase/firebase.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import path from 'node:path';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase' }),
    FirebaseModule,
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: path.join(
            __dirname,
            '../../../../libs/grpc-proto/src/proto/user.proto',
          ),
          url: process.env.USER_SERVICE_GRPC_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  providers: [AuthService, FirebaseAuthStrategy],
  exports: [AuthService],
})
export class AuthModule {}
