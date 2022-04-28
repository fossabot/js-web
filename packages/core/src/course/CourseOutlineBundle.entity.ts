import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Base } from '../base/Base.entity';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';
import { CourseOutline } from './CourseOutline.entity';

@Entity()
export class CourseOutlineBundle extends Base {
  @Column({ nullable: false, type: 'text' })
  name: string;

  @ManyToMany(
    () => CourseOutline,
    (courseOutline) => courseOutline.courseOutlineBundle,
  )
  @JoinTable({ name: 'course_outline_bundle_item' })
  courseOutline: CourseOutline[];

  @ManyToMany(
    () => SubscriptionPlan,
    (subscriptionPlan) => subscriptionPlan.courseOutlineBundle,
    { onDelete: 'CASCADE' },
  )
  subscriptionPlan: SubscriptionPlan[];
}
