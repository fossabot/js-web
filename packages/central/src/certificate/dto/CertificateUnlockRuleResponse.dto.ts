/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { Certificate } from '@seaccentral/core/dist/certificate/certificate.entity';
import { Exclude, Expose } from 'class-transformer';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { CertificationType } from '@seaccentral/core/dist/certificate/certificate.enum';
import { CertificateUnlockRule } from '@seaccentral/core/dist/certificate/CertificateUnlockRule.entity';
import { CertificateUnlockRuleCourseItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleCourseItem.entity';
import { CertificateUnlockRuleLearningTrackItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleLearningTrackItem.entity';

@Exclude()
class CertificateUnlockRuleCourseItemResponseDto extends CertificateUnlockRuleCourseItem {
  @Expose()
  @ApiProperty()
  courseId: string;

  @Expose()
  @ApiProperty()
  course: Course;

  @Expose()
  @ApiProperty()
  percentage: number;

  constructor(partial: Partial<CertificateUnlockRuleCourseItem>) {
    super();
    Object.assign(this, partial);
  }
}

@Exclude()
class CertificateUnlockRuleLearningTrackItemResponseDto extends CertificateUnlockRuleLearningTrackItem {
  @Expose()
  @ApiProperty()
  learningTrackId: string;

  @Expose()
  @ApiProperty()
  learningTrack: LearningTrack;

  @Expose()
  @ApiProperty()
  percentage: number;

  constructor(partial: Partial<CertificateUnlockRuleLearningTrackItem>) {
    super();
    Object.assign(this, partial);
  }
}

@Exclude()
export class CertificateUnlockRuleResponse extends CertificateUnlockRule {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  get createdById() {
    return this.createdBy.id;
  }

  @Expose()
  @ApiProperty()
  get lastModifiedById() {
    return this.lastModifiedBy.id;
  }

  @Expose()
  @ApiProperty()
  get unlockCourseRuleItems() {
    return (
      this.courseRuleItems?.map(
        (cri) => new CertificateUnlockRuleCourseItemResponseDto(cri),
      ) || []
    );
  }

  @Expose()
  @ApiProperty()
  get unlockLearningTrackRuleItems() {
    return (
      this.learningTrackRuleItems?.map(
        (lri) => new CertificateUnlockRuleLearningTrackItemResponseDto(lri),
      ) || []
    );
  }

  @Expose()
  @ApiProperty()
  certificateId: string;

  @Expose()
  @ApiProperty()
  certificate: Certificate;

  @Expose()
  @ApiProperty()
  ruleName: string;

  @Expose()
  @ApiProperty()
  createdBy: User;

  @Expose()
  @ApiProperty()
  lastModifiedBy: User;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  unlockType: CertificationType;

  constructor(partial: Partial<CertificateUnlockRule>) {
    super();
    Object.assign(this, partial);
  }
}
