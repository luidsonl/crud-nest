import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/user/dto';

export class BookmarkResponseDto {
  @ApiProperty({
    description: 'Bookmark UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Bookmark title',
    example: 'NestJS Documentation',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Bookmark description',
    example: 'Official NestJS framework documentation',
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Bookmark URL',
    example: 'https://docs.nestjs.com',
    required: false,
  })
  @Expose()
  link?: string;

  @ApiProperty({
    description: 'User ID who owns the bookmark',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: 'User who owns the bookmark',
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user?: UserResponseDto;

  constructor(partial: Partial<BookmarkResponseDto>) {
    Object.assign(this, partial);
  }
}