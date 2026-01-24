import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateBookmarkDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUrl()
  link?: string;
}