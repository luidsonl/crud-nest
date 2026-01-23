import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User unique identifier (UUID)',
    format: 'uuid'
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    format: 'email'
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    minLength: 2,
    maxLength: 100
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Account creation date',
    type: 'string',
    format: 'date-time'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Last profile update date',
    type: 'string',
    format: 'date-time'
  })
  @Expose()
  updatedAt: Date;
}

export class EditUserDto {
  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  password?: string;
}