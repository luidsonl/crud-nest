import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { jwtGuard } from 'src/auth/guard';
import { GetMeDto } from './dto';
import { plainToInstance } from 'class-transformer';
import type { IUser } from 'src/auth/interfaces/user.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  @ApiOperation({
    summary: "Get current user's profile",
    description: 'Retrieves the authenticated user profile data.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: GetMeDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, or missing token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      }
    }
  })
  @UseGuards(jwtGuard)
  @Get('me')
  getMe(@GetUser() user: IUser): GetMeDto {
    const userDto = plainToInstance(GetMeDto, user, {
      excludeExtraneousValues: true,
    });
    return userDto;
  }
}