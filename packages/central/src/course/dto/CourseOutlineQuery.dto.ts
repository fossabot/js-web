import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CourseOutlineQueryDto extends BaseQueryDto {
  @IsUUID('4')
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional()
  id?: string;
}
