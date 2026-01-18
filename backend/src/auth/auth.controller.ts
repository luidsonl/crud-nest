import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, UserDTO, SignInResponseDto, SignUpResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @ApiOperation({ summary: 'Register new user' })
    @ApiResponse({ status: 201, type: SignUpResponseDto })
    @ApiResponse({ status: 403, description: 'Email already exists' })
    async signUp(@Body() dto: SignUpDto): Promise<SignUpResponseDto> {
        const user = await this.authService.signUp(dto);
        const userResponse = plainToInstance(UserDTO, user, {
            excludeExtraneousValues: true,
        });
        return { user: userResponse };
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate user' })
    @ApiResponse({ status: 200, type: SignInResponseDto })
    @ApiResponse({ status: 403, description: 'Invalid credentials' })
    async signIn(@Body() dto: SignInDto): Promise<SignInResponseDto> {
        const { access_token, user } = await this.authService.signIn(dto);
        const userResponse = plainToInstance(UserDTO, user, {
            excludeExtraneousValues: true,
        });
        return { access_token, user: userResponse };
    }
}

