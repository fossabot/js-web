/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { CourseDirectAccess } from '@seaccentral/core/dist/course/CourseDirectAccess.entity';

export class CourseDirectAccessUploadFile {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  key: string;
}

export class CourseDirectAccessBulkUpload extends CourseDirectAccess {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;
}

export class CourseDirectAccessBulkUploadBody {
  courseDirectAccess: CourseDirectAccessBulkUpload[];

  metadata: CourseDirectAccessUploadFile;
}
