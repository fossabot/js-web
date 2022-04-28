import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { CourseType } from '@seaccentral/core/dist/course/courseType.enum';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class CourseQueryDto extends BaseQueryDto {
  @IsEnum(CourseType)
  @IsOptional()
  @ApiProperty()
  type?: CourseType = CourseType.Online;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  allLanguages?: boolean = false;
}
