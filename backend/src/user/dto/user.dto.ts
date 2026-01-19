import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMeDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'usuario@email.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'João Silva' })
  @Expose()
  name: string;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  @Expose()
  updatedAt: Date;
}