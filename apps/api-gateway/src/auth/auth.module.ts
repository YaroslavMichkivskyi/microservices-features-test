import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './strategies/firebase.strategy';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase' }),
    FirebaseModule,
  ],
  providers: [AuthService, FirebaseAuthStrategy],
  exports: [AuthService],
})
export class AuthModule {}
