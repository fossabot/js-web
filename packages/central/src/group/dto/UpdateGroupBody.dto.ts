import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGroupBody {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  showOnlySubscribedCourses?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  disableUpgrade?: boolean;
}
