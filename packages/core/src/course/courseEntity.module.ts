import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserScormMetadata } from '../scorm/UserScormMetadata.entity';

import { Tag } from '../tag/Tag.entity';
import { Course } from './Course.entity';
import { Media } from '../media/media.entity';
import { Topic } from '../topic/Topic.entity';
import { CourseTag } from './CourseTag.entity';
import { CourseRule } from './CourseRule.entity';
import { CourseTopic } from './CourseTopic.entity';
import { Language } from '../language/Language.entity';
import { CourseOutline } from './CourseOutline.entity';
import { CourseSession } from './CourseSession.entity';
import { CourseRuleItem } from './CourseRuleItem.entity';
import { CourseCategory } from './CourseCategory.entity';
import { CourseMaterial } from './CourseMaterial.entity';
import { BaseMaterial } from '../material/material.entity';
import { CourseSubCategory } from './CourseSubCategory.entity';
import { UserEnrolledCourse } from './UserEnrolledCourse.entity';
import { LearningWay } from '../learning-way/LearningWay.entity';
import { CourseDirectAccess } from './CourseDirectAccess.entity';
import { UserArchivedCourse } from './UserArchivedCourse.entity';
import { UserAssignedCourse } from './UserAssignedCourse.entity';
import { CourseOutlineBundle } from './CourseOutlineBundle.entity';
import { CourseSessionBooking } from './CourseSessionBooking.entity';
import { CoreMaterialModule } from '../material/coreMaterial.module';
import { ProductItemRaw } from '../raw-product/ProductItemRaw.entity';
import { CourseSessionInstructor } from './CourseSessionInstructor.entity';
import { UserCourseOutlineProgress } from './UserCourseOutlineProgress.entity';
import { CourseOutlineMediaPlayList } from './CourseOutlineMediaPlaylist.entity';
import { CourseSessionUploadHistory } from './CourseSessionUploadHistory.entity';
import { UserVideoCourseOutlineMetadata } from './UserVideoCourseOutlineMetadata.entity';
import { LearningContentFile } from '../learning-content-file/LearningContentFile.entity';
import { CourseDirectAccessUploadHistory } from './CourseDirectAccessUploadHistory.entity';
import { UserAssignedCourseUploadHistory } from './UserAssignedCourseUploadHistory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseCategory,
      CourseSubCategory,
      CourseMaterial,
      CourseOutline,
      CourseOutlineMediaPlayList,
      CourseSession,
      CourseSessionInstructor,
      CourseSessionBooking,
      CourseTag,
      CourseTopic,
      LearningWay,
      Topic,
      Tag,
      LearningContentFile,
      ProductItemRaw,
      BaseMaterial,
      Media,
      CourseRule,
      CourseRuleItem,
      CourseSessionUploadHistory,
      UserCourseOutlineProgress,
      UserEnrolledCourse,
      Language,
      UserScormMetadata,
      CourseOutlineBundle,
      UserVideoCourseOutlineMetadata,
      UserArchivedCourse,
      CourseDirectAccess,
      CourseDirectAccessUploadHistory,
      UserAssignedCourse,
      UserAssignedCourseUploadHistory,
    ]),
    CoreMaterialModule,
  ],
  exports: [TypeOrmModule],
})
export class CourseEntityModule {}
