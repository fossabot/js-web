/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';

export class CourseSessionUploadFile {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  key: string;
}

export class CourseSessionBulkUpload extends CourseSession {
  @IsUUID('4', { each: true })
  @IsArray()
  @ApiProperty()
  instructorsIds: string[];

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  courseOutlineId: string;
}

export class CourseSessionBulkUploadBody {
  courseSessions: CourseSessionBulkUpload[];

  metadata: CourseSessionUploadFile;
}
