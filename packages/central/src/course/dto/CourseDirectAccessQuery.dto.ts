import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { CourseDirectAccessorType } from '@seaccentral/core/dist/course/CourseDirectAccess.entity';

export class CourseDirectAccessQueryDto extends BaseQueryDto {
  @IsEnum(CourseDirectAccessorType)
  @IsOptional()
  @IsIn([
    CourseDirectAccessorType.User,
    CourseDirectAccessorType.Group,
    CourseDirectAccessorType.Organization,
  ])
  @ApiPropertyOptional()
  accessorType?: CourseDirectAccessorType = CourseDirectAccessorType.User;
}
