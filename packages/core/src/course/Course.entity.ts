import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { CourseTag } from './CourseTag.entity';
import { CourseStatus } from './courseStatus.enum';
import { CourseTopic } from './CourseTopic.entity';
import { CourseLanguage } from './courseLanguage.enum';
import { CourseOutline } from './CourseOutline.entity';
import { Language } from '../language/Language.entity';
import { CourseCategory } from './CourseCategory.entity';
import { CourseMaterial } from './CourseMaterial.entity';
import { UserEnrolledCourse } from './UserEnrolledCourse.entity';
import { UserArchivedCourse } from './UserArchivedCourse.entity';
import { UserAssignedCourse } from './UserAssignedCourse.entity';
import { CertificateUnlockRuleCourseItem } from '../certificate/CertificateUnlockRuleCourseItem.entity';

@Entity()
export class Course extends Base {
  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  title?: Language;

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

  @ManyToOne(() => CourseCategory, {
    nullable: false,
    eager: true,
  })
  category: CourseCategory;

  @Column({ type: 'enum', enum: CourseLanguage, nullable: false })
  availableLanguage!: CourseLanguage;

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
  courseTarget?: Language | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  isPublic: boolean;

  @Column({ type: 'enum', enum: CourseStatus, nullable: false })
  status: CourseStatus;

  @OneToMany(() => CourseOutline, (courseOutline) => courseOutline.course, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  courseOutline: CourseOutline[];

  @OneToMany(() => CourseTag, (courseTag) => courseTag.course, {
    cascade: true,
  })
  courseTag: CourseTag[];

  @OneToMany(() => CourseTopic, (courseTopic) => courseTopic.course, {
    cascade: true,
  })
  courseTopic: CourseTopic[];

  @OneToMany(() => CourseMaterial, (courseMaterial) => courseMaterial.course, {
    cascade: true,
  })
  courseMaterial: CourseMaterial[];

  @Column({ type: 'varchar', length: 200, nullable: true })
  imageKey?: string | null;

  @OneToMany(
    () => UserEnrolledCourse,
    (userEnrolledCourse) => userEnrolledCourse.course,
  )
  userEnrolledCourse: UserEnrolledCourse[];

  @OneToMany(
    () => UserArchivedCourse,
    (userArchiveCourse) => userArchiveCourse.course,
  )
  userArchivedCourse: UserArchivedCourse[];

  @OneToMany(
    () => CertificateUnlockRuleCourseItem,
    (certificateRule) => certificateRule.course,
  )
  certificateRule: CertificateUnlockRuleCourseItem[];

  @OneToMany(
    () => UserAssignedCourse,
    (userAssignedCourse) => userAssignedCourse.course,
  )
  userAssignedCourse: UserAssignedCourse[];
}
