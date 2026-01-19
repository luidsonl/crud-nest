import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IUser } from "../interfaces/user.interface";

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): IUser => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
);