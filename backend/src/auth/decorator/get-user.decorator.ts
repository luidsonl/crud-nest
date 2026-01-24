import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../interfaces/user.interface';

export const GetUser = createParamDecorator(
  (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IUser = request.user;

    if (data) {
      return user[data];
    }
    return user;
  },
);
