import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

import { CourseDirectAccessorType } from '@seaccentral/core/dist/course/CourseDirectAccess.entity';

export class CourseDirectAccessBody {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  accessorId: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  expiryDateTime: string;

  @IsEnum(CourseDirectAccessorType)
  @IsIn([
    CourseDirectAccessorType.User,
    CourseDirectAccessorType.Group,
    CourseDirectAccessorType.Organization,
  ])
  @ApiProperty()
  accessorType: CourseDirectAccessorType;
}
