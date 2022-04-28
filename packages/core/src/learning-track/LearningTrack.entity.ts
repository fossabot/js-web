import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Language } from '../language/Language.entity';
import { CourseStatus } from '../course/courseStatus.enum';
import { LearningTrackTag } from './LearningTrackTag.entity';
import { CourseCategory } from '../course/CourseCategory.entity';
import { LearningTrackTopic } from './LearningTrackTopic.entity';
import { LearningTrackSection } from './LearningTrackSection.entity';
import { LearningTrackMaterial } from './LearningTrackMaterial.entity';
import { UserEnrolledLearningTrack } from './UserEnrolledLearningTrack.entity';
import { UserArchivedLearningTrack } from './UserArchivedLearningTrack.entity';
import { UserAssignedLearningTrack } from './UserAssignedLearningTrack.entity';

@Entity()
export class LearningTrack extends Base {
  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  title: Language | null;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  tagLine?: Language | null;

  @Column({ default: 0 })
  durationMinutes: number;

  @Column({ default: 0 })
  durationHours: number;

  @Column({ default: 0 })
  durationDays: number;

  @Column({ default: 0 })
  durationWeeks: number;

  @Column({ default: 0 })
  durationMonths: number;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  description?: Language | null;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  learningObjective?: Language | null;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  learningTrackTarget?: Language | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  isPublic: boolean;

  @Column({ type: 'enum', enum: CourseStatus, nullable: false })
  status: CourseStatus;

  @Column({ type: 'boolean', nullable: false, default: false })
  isFeatured: boolean;

  @ManyToOne(() => CourseCategory, {
    nullable: false,
    eager: true,
  })
  category: CourseCategory;

  @OneToMany(
    () => LearningTrackSection,
    (learningTrackSection) => learningTrackSection.learningTrack,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  learningTrackSection: LearningTrackSection[];

  @OneToMany(
    () => LearningTrackTag,
    (learningTrackTag) => learningTrackTag.learningTrack,
    {
      cascade: true,
    },
  )
  learningTrackTag: LearningTrackTag[];

  @OneToMany(
    () => LearningTrackTopic,
    (learningTrackTopic) => learningTrackTopic.learningTrack,
    {
      cascade: true,
    },
  )
  learningTrackTopic: LearningTrackTopic[];

  @OneToMany(
    () => LearningTrackMaterial,
    (learningTrackMaterial) => learningTrackMaterial.learningTrack,
    {
      cascade: true,
    },
  )
  learningTrackMaterial: LearningTrackMaterial[];

  @Column({ type: 'varchar', length: 200, nullable: true })
  imageKey?: string | null;

  @OneToMany(
    () => UserEnrolledLearningTrack,
    (userEnrolledLearningTrack) => userEnrolledLearningTrack.learningTrack,
  )
  userEnrolledLearningTrack: UserEnrolledLearningTrack[];

  @OneToMany(
    () => UserArchivedLearningTrack,
    (userArchiveLearningTrack) => userArchiveLearningTrack.learningTrack,
  )
  userArchivedLearningTrack: UserArchivedLearningTrack[];

  @OneToMany(
    () => UserAssignedLearningTrack,
    (userAssignedLearningTrack) => userAssignedLearningTrack.learningTrack,
  )
  userAssignedLearningTrack: UserAssignedLearningTrack[];
}
