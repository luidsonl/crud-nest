import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    signUp(@Body() dto: SignUpDto) {
        return this.authService.signUp(dto);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    signIn(@Body() dto: SignInDto) {
        return this.authService.signIn(dto);
    }
}
