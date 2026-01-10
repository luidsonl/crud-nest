import { Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    signUp(@Req() request: Request) {
        return this.authService.signUp();
    }

    @Post('signin')
    signIn(@Req() request: Request) {
        return this.authService.signIn();
    }
}
