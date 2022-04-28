/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UserAssignedCourse } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';

export class UserAssignedCourseUploadFile {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  key: string;
}

export class UserAssignedCourseBulkUpload extends UserAssignedCourse {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;
}

export class UserAssignedCourseBulkUploadBody {
  userAssignedCourses: UserAssignedCourseBulkUpload[];

  metadata: UserAssignedCourseUploadFile;
}
