import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { jwtGuard } from 'src/auth/guard';
import { GetMeDto } from './dto';
import { plainToInstance } from 'class-transformer';
import type { IUser } from 'src/auth/interfaces/user.interface';

@ApiTags('Users')
@Controller('users')

export class UserController {

    @ApiOperation({ summary: "Get current user's profile" })
    @UseGuards(jwtGuard)
    @Get('me')
    getMe(@GetUser() user: IUser) {
        const userDto = plainToInstance(GetMeDto, user, {
            excludeExtraneousValues: true,
        });
        return userDto;
    }
}
