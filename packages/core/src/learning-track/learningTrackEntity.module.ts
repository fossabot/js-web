import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Language } from '../language/Language.entity';
import { LearningTrack } from './LearningTrack.entity';
import { LearningTrackTag } from './LearningTrackTag.entity';
import { LearningTrackTopic } from './LearningTrackTopic.entity';
import { CourseEntityModule } from '../course/courseEntity.module';
import { CoreMaterialModule } from '../material/coreMaterial.module';
import { LearningTrackSection } from './LearningTrackSection.entity';
import { LearningTrackMaterial } from './LearningTrackMaterial.entity';
import { UserEnrolledLearningTrack } from './UserEnrolledLearningTrack.entity';
import { UserArchivedLearningTrack } from './UserArchivedLearningTrack.entity';
import { LearningTrackDirectAccess } from './LearningTrackDirectAccess.entity';
import { UserAssignedLearningTrack } from './UserAssignedLearningTrack.entity';
import { LearningTrackSectionCourse } from './LearningTrackSectionCourse.entity';
import { LearningTrackDirectAccessUploadHistory } from './LearningTrackDirectAccessUploadHistory.entity';
import { UserAssignedLearningTrackUploadHistory } from './UserAssignedLearningTrackUploadHistory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningTrack,
      LearningTrackTag,
      LearningTrackTopic,
      LearningTrackSection,
      LearningTrackMaterial,
      UserEnrolledLearningTrack,
      LearningTrackSectionCourse,
      UserArchivedLearningTrack,
      Language,
      LearningTrackDirectAccess,
      LearningTrackDirectAccessUploadHistory,
      UserAssignedLearningTrack,
      UserAssignedLearningTrackUploadHistory,
    ]),
    CoreMaterialModule,
    CourseEntityModule,
  ],
  exports: [TypeOrmModule],
})
export class LearningTrackEntityModule {}
