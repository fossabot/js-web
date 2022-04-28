import { UserCourseOutlineProgress } from '@seaccentral/core/dist/course/UserCourseOutlineProgress.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import {
  TranslatedCourseOutlineResponseDto,
  TranslatedCourseResponseDto,
} from './CourseResponse.dto';

export class UserCourseOutlineProgressDto extends UserCourseOutlineProgress {
  constructor(data: UserCourseOutlineProgress, acceptLanguage: LanguageCode) {
    super();
    const course = { ...data.courseOutline.course };
    Object.assign(this, {
      ...data,
      courseOutline: {
        ...new TranslatedCourseOutlineResponseDto(
          data.courseOutline,
          acceptLanguage,
        ),
        course: new TranslatedCourseResponseDto(course, acceptLanguage),
      },
    });
  }
}
