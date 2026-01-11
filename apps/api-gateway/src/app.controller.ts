import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './common/guards/firebase-auth.guard';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { UserContext } from './common/types/user-context.type';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('secure')
  secure(@CurrentUser() user: UserContext) {
    return { user };
  }
}
