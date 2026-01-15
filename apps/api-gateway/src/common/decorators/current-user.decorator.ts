import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from '@fleetops/shared';

export const CurrentUser = createParamDecorator<void, UserContext>(
  (_data: void, ctx: ExecutionContext): UserContext => {
    const request = ctx.switchToHttp().getRequest<{ user: UserContext }>();
    return request.user;
  },
);
