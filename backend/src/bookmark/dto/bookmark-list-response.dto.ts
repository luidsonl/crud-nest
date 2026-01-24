import { Exclude, Expose, Type } from 'class-transformer';
import { BookmarkResponseDto } from './bookmark-response.dto';

export class BookmarkListResponseDto {
  @Expose()
  @Type(() => BookmarkResponseDto)
  data: BookmarkResponseDto[];

  @Expose()
  total: number;

  constructor(data: BookmarkResponseDto[], total: number) {
    this.data = data;
    this.total = total;
  }
}