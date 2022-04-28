/* eslint-disable max-classes-per-file */

import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  transformLanguage,
  getStringFromLanguage,
} from '@seaccentral/core/dist/utils/language';
import {
  Language,
  LanguageCode,
} from '@seaccentral/core/dist/language/Language.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { LearningTrackTag } from '@seaccentral/core/dist/learning-track/LearningTrackTag.entity';
import { LearningTrackTopic } from '@seaccentral/core/dist/learning-track/LearningTrackTopic.entity';
import { LearningTrackSection } from '@seaccentral/core/dist/learning-track/LearningTrackSection.entity';
import { LearningTrackMaterial } from '@seaccentral/core/dist/learning-track/LearningTrackMaterial.entity';
import { LearningTrackSectionCourse } from '@seaccentral/core/dist/learning-track/LearningTrackSectionCourse.entity';

import { TranslatedCourseResponseDto } from '../../course/dto/CourseResponse.dto';

class TranslatedCourseSectionResponseDto extends TranslatedCourseResponseDto {
  @Expose()
  @ApiProperty()
  isRequired: boolean;

  constructor(
    sectionCourse: LearningTrackSectionCourse,
    langCode: LanguageCode,
  ) {
    super(sectionCourse.course, langCode);
    this.isRequired = sectionCourse.isRequired;
  }
}
class LearningTrackSectionResponseDto extends LearningTrackSection {
  @Expose()
  @ApiProperty()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: Language;

  @Expose()
  @ApiProperty()
  get courses() {
    return this.learningTrackSectionCourse?.map(
      (ltsc) => new TranslatedCourseSectionResponseDto(ltsc, LanguageCode.EN),
    );
  }

  @Expose()
  @ApiProperty()
  get courseIds() {
    return this.learningTrackSectionCourse?.map((ltsc) => ltsc.course.id);
  }

  @Exclude()
  learningTrackSectionCourse: LearningTrackSectionCourse[];

  constructor(learningTrackSection: Partial<LearningTrackSection>) {
    super();
    Object.assign(this, learningTrackSection);
  }
}

export class TranslatedLearningTrackSectionResponseDto extends LearningTrackSectionResponseDto {
  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: string;

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get courses() {
    return this.learningTrackSectionCourse?.map(
      (ltsc) => new TranslatedCourseSectionResponseDto(ltsc, this.langCode),
    );
  }

  constructor(
    learningTrackSection: Partial<LearningTrackSection>,
    langCode: LanguageCode,
  ) {
    super(learningTrackSection);

    this.langCode = langCode;
    if (
      learningTrackSection.learningTrack &&
      learningTrackSection.learningTrack.title
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.learningTrack.title = getStringFromLanguage(
        learningTrackSection.learningTrack.title,
        langCode,
      );
    }
    this.title = getStringFromLanguage(learningTrackSection.title, langCode);
  }
}

export class LearningTrackResponseDto extends LearningTrack {
  @Expose()
  @ApiProperty()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tagLine?: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  description?: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningTrackTarget?: Language;

  @Expose()
  @ApiPropertyOptional()
  @Transform(transformLanguage)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningObjective?: Language;

  @Expose()
  @ApiProperty()
  get tags() {
    return (
      this.learningTrackTag
        ?.filter((ltt) => !!ltt.tag?.id)
        .map((ltt) => ltt.tag) || []
    );
  }

  @Expose()
  @ApiProperty()
  get materials() {
    return (
      this.learningTrackMaterial
        ?.filter((ltm) => !!ltm.material?.id)
        .map((ltm) => ltm.material) || []
    );
  }

  @Expose()
  @ApiProperty()
  get topics() {
    return (
      this.learningTrackTopic
        ?.filter((ltt) => !!ltt.topic?.id)
        .map((ltt) => ltt.topic) || []
    );
  }

  @Expose()
  @ApiProperty()
  get tagIds() {
    return (
      this.learningTrackTag
        ?.filter((ltt) => !!ltt.tag?.id)
        .map((ltt) => ltt.tag.id) || []
    );
  }

  @Expose()
  @ApiProperty()
  get materialIds() {
    return (
      this.learningTrackMaterial
        ?.filter((ltm) => !!ltm.material?.id)
        .map((ltm) => ltm.material.id) || []
    );
  }

  @Expose()
  @ApiProperty()
  get topicIds() {
    return (
      this.learningTrackTopic
        ?.filter((ltt) => !!ltt.topic?.id)
        .map((ltt) => ltt.topic.id) || []
    );
  }

  @Expose()
  @ApiProperty()
  get categoryId() {
    return this.category.id;
  }

  @Expose()
  @ApiProperty()
  get learningTrackSections(): LearningTrackSectionResponseDto[] {
    return this.learningTrackSection?.map(
      (lts) => new LearningTrackSectionResponseDto(lts),
    );
  }

  @Exclude()
  learningTrackSection: LearningTrackSection[];

  @Exclude()
  learningTrackTag: LearningTrackTag[];

  @Exclude()
  learningTrackMaterial: LearningTrackMaterial[];

  @Exclude()
  learningTrackTopic: LearningTrackTopic[];

  constructor(learningTrack: Partial<LearningTrack>) {
    super();
    Object.assign(this, learningTrack);
  }
}

export class TranslatedLearningTrackResponseDto extends LearningTrackResponseDto {
  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  title: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tagLine?: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  description?: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningTrackTarget?: string;

  @Expose()
  @ApiPropertyOptional()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  learningObjective?: string;

  @Expose()
  @ApiProperty()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get learningTrackSections() {
    return this.learningTrackSection?.map(
      (lts) =>
        new TranslatedLearningTrackSectionResponseDto(lts, this.langCode),
    );
  }

  constructor(course: Partial<LearningTrack>, langCode: LanguageCode) {
    super(course);
    this.langCode = langCode;
    this.title = getStringFromLanguage(course.title, langCode);
    this.tagLine = getStringFromLanguage(course.tagLine, langCode);
    this.description = getStringFromLanguage(course.description, langCode);
    this.learningTrackTarget = getStringFromLanguage(
      course.learningTrackTarget,
      langCode,
    );
    this.learningObjective = getStringFromLanguage(
      course.learningObjective,
      langCode,
    );
  }
}
