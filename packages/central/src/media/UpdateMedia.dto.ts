import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
