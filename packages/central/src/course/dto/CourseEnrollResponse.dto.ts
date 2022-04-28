import { Expose, Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { TranslatedCourseResponseDto } from './CourseResponse.dto';

export interface IEnrollCourseResponse {
  success: boolean;
  preRequisiteCourse: Course | null;
}

@Exclude()
export class TranslatedEnrollStatusResponse {
  @Expose()
  @ApiProperty()
  success: boolean;

  @Expose()
  @ApiProperty()
  preRequisiteCourse: TranslatedCourseResponseDto | null;

  constructor(
    enrollCourseResponse: IEnrollCourseResponse,
    langCode: LanguageCode,
  ) {
    this.success = enrollCourseResponse.success;
    this.preRequisiteCourse = enrollCourseResponse.preRequisiteCourse
      ? new TranslatedCourseResponseDto(
          enrollCourseResponse.preRequisiteCourse,
          langCode,
        )
      : null;
  }
}
