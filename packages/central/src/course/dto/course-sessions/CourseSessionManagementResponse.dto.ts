/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';

export class CourseOutlineDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  id: string;
}

class CourseDto {
  @ApiProperty({ type: CourseOutlineDto })
  courseOutlines: CourseOutlineDto[];

  @ApiProperty()
  title: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionCount: number;
}

export class CourseSessionManagementResponseDto {
  @ApiProperty({ type: CourseDto })
  courses: CourseDto[];

  @ApiProperty()
  totalSessionCount: number;
}
