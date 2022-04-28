import { Column, Entity, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { CourseRule } from './CourseRule.entity';
import { CourseOutline } from './CourseOutline.entity';

export enum CourseRuleType {
  REQUIRED = 'required',
  BOOK = 'book',
  PRE_ASSESSMENT = 'pre-assessment',
}

@Entity()
export class CourseRuleItem extends Base {
  @ManyToOne(() => CourseRule, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  courseRule!: CourseRule;

  @ManyToOne(() => CourseOutline, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  appliedFor!: CourseOutline;

  @ManyToOne(() => CourseOutline, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  appliedBy!: CourseOutline;

  @Column({
    type: 'enum',
    nullable: false,
    enum: CourseRuleType,
    default: CourseRuleType.REQUIRED,
  })
  type!: CourseRuleType;
}
