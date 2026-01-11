import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { UserContext } from '../../common/types/user-context.type';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase',
) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<UserContext> {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    const decodedToken: DecodedIdToken =
      await this.authService.verifyToken(token);

    return await this.authService.enrichUserContext(decodedToken);
  }
}
