import { Controller, Get, UseGuards, HttpStatus, Patch, Body } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator';
import { jwtGuard } from 'src/auth/guard';
import { GetMeDto, EditUserDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import type { IUser } from 'src/auth/interfaces/user.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }
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

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: GetMeDto })
  @UseGuards(jwtGuard)
  @Patch('edit')
  async editUser(
    @GetUser('id') userId: string,
    @Body() dto: EditUserDto,
  ): Promise<GetMeDto> {
    const user = await this.userService.editUser(userId, dto);
    return plainToInstance(GetMeDto, user, {
      excludeExtraneousValues: true,
    });
  }
}