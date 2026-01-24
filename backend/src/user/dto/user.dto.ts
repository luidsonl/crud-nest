import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier (UUID)',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    format: 'email',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Account creation date',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Last profile update date',
  })
  @Expose()
  updatedAt: Date;
}

export class EditUserDto {
  @ApiProperty({ required: false, example: 'newemail@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, example: 'New Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, example: 'newPassword123' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;
}
