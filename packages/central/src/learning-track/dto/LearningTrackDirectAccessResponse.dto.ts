import { ApiProperty } from '@nestjs/swagger';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { LearningTrackDirectAccessorType } from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccess.entity';
import { Exclude, Expose } from 'class-transformer';

export interface IlearningTrackDirectAccessRaw {
  id: string;
  expiryDateTime: string;
  createdAt: Date;
  learning_track_id: string;
  learning_track_title_id: string;
  learning_track_title_nameEn: string;
  learning_track_title_nameTh: string;

  accessorType: LearningTrackDirectAccessorType;
  accessorId: string;
  accessor_id: string;
  accessor_firstName?: string;
  accessor_lastName?: string;
  accessor_email?: string;

  accessor_name?: string;
}

@Exclude()
export class TranslatedLearningTrackDirectAccessResponse {
  private learningTrackDirectAccessRaw: IlearningTrackDirectAccessRaw;

  private langCode: LanguageCode = LanguageCode.EN;

  @Expose()
  @ApiProperty()
  get id() {
    return this.learningTrackDirectAccessRaw.id;
  }

  @Expose()
  @ApiProperty()
  get createdAt() {
    return this.learningTrackDirectAccessRaw.createdAt;
  }

  @Expose()
  @ApiProperty()
  get accessorId() {
    return this.learningTrackDirectAccessRaw.accessorId;
  }

  @Expose()
  @ApiProperty()
  get accessorType() {
    return this.learningTrackDirectAccessRaw.accessorType;
  }

  @Expose()
  @ApiProperty()
  get expiryDateTime() {
    return this.learningTrackDirectAccessRaw.expiryDateTime;
  }

  @Expose()
  @ApiProperty()
  get learningTrack() {
    return {
      id: this.learningTrackDirectAccessRaw.learning_track_id,
      title:
        this.langCode === LanguageCode.EN
          ? this.learningTrackDirectAccessRaw.learning_track_title_nameEn
          : this.learningTrackDirectAccessRaw.learning_track_title_nameTh,
    };
  }

  @Expose()
  @ApiProperty()
  get accessor() {
    return {
      id: this.learningTrackDirectAccessRaw.accessor_id,
      displayName: this.learningTrackDirectAccessRaw.accessor_email
        ? `${this.learningTrackDirectAccessRaw.accessor_firstName} ${this.learningTrackDirectAccessRaw.accessor_lastName} (${this.learningTrackDirectAccessRaw.accessor_email})`.trim()
        : this.learningTrackDirectAccessRaw.accessor_name,
    };
  }

  constructor(
    learningTrackDirectAccessRaw: IlearningTrackDirectAccessRaw,
    langCode: LanguageCode,
  ) {
    this.learningTrackDirectAccessRaw = learningTrackDirectAccessRaw;
    this.langCode = langCode;
  }
}
