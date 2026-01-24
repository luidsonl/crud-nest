import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';

export class BookmarkResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  link?: string;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  user?: UserResponseDto;

  constructor(partial: Partial<BookmarkResponseDto>) {
    Object.assign(this, partial);
  }
}