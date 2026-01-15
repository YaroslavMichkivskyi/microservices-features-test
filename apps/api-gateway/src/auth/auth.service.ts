import { FirebaseService } from '../firebase/firebase.service';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { UserContext, Role } from '@fleetops/shared';
import { lastValueFrom, Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import {
  GetUserContextRequest,
  IdentityServiceClient,
  UserContextResponse,
} from '@fleetops/grpc-proto';

@Injectable()
export class AuthService implements OnModuleInit {
  private identityService: IdentityServiceClient;

  constructor(
    private readonly firebaseService: FirebaseService,
    @Inject('IDENTITY_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.identityService =
      this.client.getService<IdentityServiceClient>('IdentityService');
  }

  async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      return await this.firebaseService.auth.verifyIdToken(token);
    } catch (_) {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }

  async enrichUserContext(firebaseUser: DecodedIdToken): Promise<UserContext> {
    const request: GetUserContextRequest = { firebaseUid: firebaseUser.uid };

    const response = await lastValueFrom(
      this.identityService.getUserContext(
        request,
        () => {},
      ) as unknown as Observable<UserContextResponse>,
    );

    return {
      userId: response.userId,
      email: response.email,
      organizationId: response.organizationId,
      role: response.role as Role,
    };
  }
}
