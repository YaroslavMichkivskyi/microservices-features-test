import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FirebaseService.name);
  private app!: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    if (admin.apps.length === 0) {
      const credential = this.getCredential();

      this.app = admin.initializeApp({
        credential,
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      });

      this.logger.log('Firebase Admin SDK successfully initialized');
    } else {
      this.app = admin.app();
      this.logger.log('Firebase Admin SDK was already initialized');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.app) {
      try {
        await this.app.delete();
        this.logger.log('Firebase Admin SDK shutdown completed');
      } catch (error) {
        this.logger.error('Failed to shutdown Firebase Admin SDK', error);
      }
    }
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  private getCredential(): admin.credential.Credential {
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

    if (!privateKey || !clientEmail || !projectId) {
      throw new Error(
        'Firebase credentials not fully configured. ' +
          'Required: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID',
      );
    }

    return admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  }
}
