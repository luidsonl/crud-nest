import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BookmarkResponseDto } from './bookmark-response.dto';

export class BookmarkListResponseDto {
  @ApiProperty({
    description: 'List of bookmarks',
    type: [BookmarkResponseDto],
  })
  @Expose()
  @Type(() => BookmarkResponseDto)
  data: BookmarkResponseDto[];

  @ApiProperty({
    description: 'Total number of bookmarks',
    example: 42,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  @Expose()
  totalPages: number;

  constructor(
    data: BookmarkResponseDto[],
    total: number,
    page?: number,
    limit?: number,
  ) {
    this.data = data;
    this.total = total;
    this.page = page || 1;
    this.limit = limit || total;
    this.totalPages = limit ? Math.ceil(total / limit) : 1;
  }
}