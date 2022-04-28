import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Course } from '../course/Course.entity';
import { CertificateUnlockRule } from './CertificateUnlockRule.entity';

@Entity()
@Unique('certificate_unlock_rule_course_item_unique', ['unlockRule', 'course'])
export class CertificateUnlockRuleCourseItem extends Base {
  @Column({ nullable: false })
  unlockRuleId!: string;

  @Column({ nullable: false })
  courseId!: string;

  @Column({ default: 100, nullable: false })
  percentage!: number;

  @ManyToOne(() => CertificateUnlockRule, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  unlockRule!: CertificateUnlockRule;

  @ManyToOne(() => Course, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  course!: Course;
}
