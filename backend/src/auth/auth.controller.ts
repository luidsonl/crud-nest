import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    signUp(@Body() dto: SignUpDto) {
        console.log({dto});
        return this.authService.signUp();
    }

    @Post('signin')
    signIn(@Body() dto: SignInDto) {
        console.log({dto});
        return this.authService.signIn();
    }
}
