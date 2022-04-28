import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { Course } from './Course.entity';
import { Base } from '../base/Base.entity';
import { CourseOutlineBundle } from './CourseOutlineBundle.entity';
import { CourseSession } from './CourseSession.entity';
import { CourseSubCategory } from './CourseSubCategory.entity';
import { LearningWay } from '../learning-way/LearningWay.entity';
import { Organization } from '../organization/Organization.entity';
import { UserCourseOutlineProgress } from './UserCourseOutlineProgress.entity';
import { CourseOutlineMediaPlayList } from './CourseOutlineMediaPlaylist.entity';
import { LearningContentFile } from '../learning-content-file/LearningContentFile.entity';
import { Language } from '../language/Language.entity';
import { CourseRuleItem } from './CourseRuleItem.entity';

@Entity()
export class CourseOutline extends Base {
  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  title?: Language | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  courseCode?: string | null;

  @Column({ nullable: false })
  part!: number;

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

  @Column()
  courseId: string;

  @ManyToOne(() => Course, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  course!: Course;

  @ManyToOne(() => CourseSubCategory, {
    nullable: false,
    eager: true,
  })
  category!: CourseSubCategory;

  @ManyToOne(() => LearningWay, {
    nullable: false,
  })
  learningWay!: LearningWay;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  description?: Language | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  providerName?: string | null;

  @ManyToOne(() => Organization, {
    nullable: true,
  })
  organizationProvider?: Organization | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  thirdPartyCourseCode?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  thirdPartyPlatformUrl?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  assessmentAPIEndpoint?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  assessmentName?: string | null;

  @Column({ default: false })
  assessmentNotifyEmailStatus?: boolean;

  @Column({ default: false })
  assessmentUserCanRetest?: boolean;

  @ManyToOne(() => LearningContentFile, {
    nullable: true,
    cascade: true,
    orphanedRowAction: 'delete',
  })
  learningContentFile?: LearningContentFile | null;

  @OneToMany(
    () => CourseSession,
    (courseSession) => courseSession.courseOutline,
    { cascade: true, orphanedRowAction: 'delete' },
  )
  courseSession: CourseSession[];

  @OneToMany(
    () => CourseOutlineMediaPlayList,
    (courseOutlineMediaPlayList) => courseOutlineMediaPlayList.courseOutline,
    { cascade: true, orphanedRowAction: 'delete' },
  )
  courseOutlineMediaPlayList: CourseOutlineMediaPlayList[];

  @OneToMany(
    () => UserCourseOutlineProgress,
    (userCourseOutlineProgress) => userCourseOutlineProgress.courseOutline,
  )
  userCourseOutlineProgress: UserCourseOutlineProgress[];

  @OneToMany(
    () => CourseRuleItem,
    (courseRuleItem) => courseRuleItem.appliedFor,
  )
  courseRuleItems: CourseRuleItem[];

  @ManyToMany(
    () => CourseOutlineBundle,
    (courseOutlineBundle) => courseOutlineBundle.courseOutline,
    { onDelete: 'CASCADE' },
  )
  courseOutlineBundle: CourseOutlineBundle[];
}
