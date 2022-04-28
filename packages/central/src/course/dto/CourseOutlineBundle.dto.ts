// eslint-disable-next-line max-classes-per-file
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseOutlineBundle } from '@seaccentral/core/dist/course/CourseOutlineBundle.entity';
import { BaseEntityFullDto } from '@seaccentral/core/dist/dto/BaseEntity.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { Exclude, Expose } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DeepPartial } from 'typeorm';

class CourseOutlineBundleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}

export class CreateCourseOutlineBundle extends CourseOutlineBundleDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty()
  courseOutlineIds: string[];

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isActive = true;
}

export class CreateCourseOutlineBundleResponse extends IntersectionType(
  BaseEntityFullDto,
  CourseOutlineBundleDto,
) {
  @ApiProperty({
    isArray: true,
    nullable: true,
  })
  courseOutline: { id: string }[] | null;
}

export class CourseOutlineBundleResponse extends IntersectionType(
  BaseEntityFullDto,
  CourseOutlineBundleDto,
) {
  @Exclude()
  acceptLanguage: LanguageCode;

  @Exclude()
  courseOutlineBundle: CourseOutlineBundle;

  @Expose({ name: 'id' })
  get bundleId() {
    return this.courseOutlineBundle.id;
  }

  @Expose({ name: 'isActive' })
  get bundleIsActive() {
    return this.courseOutlineBundle.isActive;
  }

  @Expose({ name: 'createdAt' })
  get bundlecreatedAt() {
    return this.courseOutlineBundle.createdAt;
  }

  @Expose({ name: 'updatedAt' })
  get bundleUpdatedAt() {
    return this.courseOutlineBundle.updatedAt;
  }

  @Expose({ name: 'name' })
  get bundleName() {
    return this.courseOutlineBundle.name;
  }

  @Expose({ name: 'courseOutline' })
  @ApiProperty({
    isArray: true,
  })
  get TranslatedCourseOutline() {
    return this.courseOutlineBundle.courseOutline.map(
      (co: Partial<CourseOutline>) => ({
        ...co,
        title: getStringFromLanguage(co.title, this.acceptLanguage),
        description: getStringFromLanguage(co.description, this.acceptLanguage),
      }),
    );
  }

  constructor(
    courseOutlineBundle: DeepPartial<CourseOutlineBundle>,
    acceptLanguage?: LanguageCode,
  ) {
    super(courseOutlineBundle);
    Object.assign(this, {
      courseOutlineBundle,
      acceptLanguage: acceptLanguage || LanguageCode.EN,
    });
  }
}

export class AllCourseOutlineBundleResponse extends IntersectionType(
  BaseEntityFullDto,
  CourseOutlineBundleDto,
) {
  constructor(courseOutlineBundle: DeepPartial<CourseOutlineBundle>) {
    super(courseOutlineBundle);
    Object.assign(this, courseOutlineBundle);
  }
}
