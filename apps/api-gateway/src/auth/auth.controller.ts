import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserContext } from '@fleetops/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Current user context',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usr_123abc' },
        email: { type: 'string', example: 'user@example.com' },
        organizationId: { type: 'string', example: 'org_456def' },
        role: {
          type: 'string',
          enum: ['OWNER', 'ADMIN', 'USER'],
          example: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getCurrentUser(@CurrentUser() user: UserContext): UserContext {
    return user;
  }
}
