import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UserContext } from '../common/types/user-context.type';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      return await this.firebaseService.auth.verifyIdToken(token);
    } catch (_) {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }

  async enrichUserContext(firebaseUser: DecodedIdToken): Promise<UserContext> {
    // TODO: Later replace with gRPC call to User/Organization service
    // or database lookup by firebase uid

    return {
      userId: firebaseUser.uid,
      email: firebaseUser.email ?? undefined,
      organizationId: 'temp-org-123',
      role: firebaseUser.admin ? 'ADMIN' : 'USER',
    };
  }
}
