import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { CourseCategoryKey } from '@seaccentral/core/dist/course/CourseCategory.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';

import { TranslatedLearningTrackResponseDto } from './learningTrackResponse.dto';

export class LearningTrackSearchResponseDto extends TranslatedLearningTrackResponseDto {
  @Expose()
  @ApiProperty()
  get learningTrackCategory() {
    return {
      id: this.category?.id as string,
      key: this.category?.key as CourseCategoryKey,
      name: this.category?.name as string,
    };
  }

  @Expose()
  @ApiProperty()
  hasCertificate: boolean;

  constructor(
    learningTrack: Partial<LearningTrack>,
    langCode: LanguageCode,
    hasCertificate = false,
  ) {
    super(learningTrack, langCode);
    this.hasCertificate = hasCertificate;
  }
}
