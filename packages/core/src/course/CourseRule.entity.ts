import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { CourseRuleItem } from './CourseRuleItem.entity';

@Entity()
export class CourseRule extends Base {
  @Column({ type: 'varchar', length: 80, nullable: false })
  name!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy!: User;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  lastModifiedBy!: User;

  @OneToMany(
    () => CourseRuleItem,
    (courseRuleItem) => courseRuleItem.courseRule,
    { cascade: true, orphanedRowAction: 'delete' },
  )
  courseRuleItem: CourseRuleItem[];
}
