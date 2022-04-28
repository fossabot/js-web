import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';
import { CourseOutline } from '../course/CourseOutline.entity';

@Entity()
@Unique('course_assessment_unique', ['courseOutline', 'user'])
export class ExternalAssessment extends Base {
  @Column()
  externalId: string;

  @Column()
  status: string;

  @Column()
  assessmentUrl: string;

  @Column({ type: 'text', nullable: true })
  reportUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  vendor?: string | null;

  @Column()
  courseOutlineId: string;

  @ManyToOne(() => CourseOutline, { onDelete: 'CASCADE' })
  courseOutline: CourseOutline;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;
}
