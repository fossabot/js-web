import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';

@Exclude()
export class TranslatedCourseDirectAccessResponse {
  private courseDirectAccessRaw: any;

  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  get id() {
    return this.courseDirectAccessRaw.id;
  }

  @Expose()
  @ApiProperty()
  get createdAt() {
    return this.courseDirectAccessRaw.createdAt;
  }

  @Expose()
  @ApiProperty()
  get accessorId() {
    return this.courseDirectAccessRaw.accessorId;
  }

  @Expose()
  @ApiProperty()
  get accessorType() {
    return this.courseDirectAccessRaw.accessorType;
  }

  @Expose()
  @ApiProperty()
  get expiryDateTime() {
    return this.courseDirectAccessRaw.expiryDateTime;
  }

  @Expose()
  @ApiProperty()
  get course() {
    return {
      id: this.courseDirectAccessRaw.course_id,
      title:
        this.langCode === LanguageCode.EN
          ? this.courseDirectAccessRaw.course_title_nameEn
          : this.courseDirectAccessRaw.course_title_nameTh,
    };
  }

  @Expose()
  @ApiProperty()
  get accessor() {
    return {
      id: this.courseDirectAccessRaw.accessor_id,
      displayName: this.courseDirectAccessRaw.accessor_email
        ? `${this.courseDirectAccessRaw.accessor_firstName} ${this.courseDirectAccessRaw.accessor_lastName} (${this.courseDirectAccessRaw.accessor_email})`.trim()
        : this.courseDirectAccessRaw.accessor_name,
    };
  }

  constructor(courseDirectAccessRaw: any, langCode: LanguageCode) {
    this.courseDirectAccessRaw = courseDirectAccessRaw;
    this.langCode = langCode;
  }
}
