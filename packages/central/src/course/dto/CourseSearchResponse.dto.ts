/* eslint-disable max-classes-per-file */
import { Exclude, Expose } from 'class-transformer';

import { Course } from '@seaccentral/core/dist/course/Course.entity';
import {
  CourseCategory,
  CourseCategoryKey,
} from '@seaccentral/core/dist/course/CourseCategory.entity';
import { CourseSubCategoryKey } from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { ApiProperty } from '@nestjs/swagger';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { TranslatedCourseResponseDto } from './CourseResponse.dto';

class Category {
  id: string;

  key: CourseCategoryKey | CourseSubCategoryKey;

  name: string;
}

export class CourseSearchResponseDto extends TranslatedCourseResponseDto {
  @Expose()
  @ApiProperty()
  get courseCategory() {
    return {
      id: this.category?.id as string,
      key: this.category?.key as CourseCategoryKey,
      name: this.category?.name as string,
    };
  }

  @Expose()
  @ApiProperty()
  get courseSubCategories() {
    return this.courseOutline
      ?.map((co: CourseOutline) => {
        return {
          id: co.category.id,
          key: co.category.key,
          name: co.category.name,
        };
      })
      .reduce((prev: Category[], curr) => {
        if (prev.find((item) => item.id === curr.id)) {
          return prev;
        }
        return [...prev, curr];
      }, []);
  }

  @Exclude()
  courseOutline: CourseOutline[];

  @Exclude()
  category: CourseCategory;

  @Expose()
  @ApiProperty()
  hasCertificate: boolean;

  constructor(
    course: Partial<Course>,
    langCode: LanguageCode,
    hasCertificate = false,
  ) {
    super(course, langCode);
    this.hasCertificate = hasCertificate;
  }
}
