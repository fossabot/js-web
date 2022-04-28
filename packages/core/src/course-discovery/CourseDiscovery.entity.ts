import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Course } from '../course/Course.entity';

export enum CourseDiscoveryType {
  'HIGHLIGHT' = 'highlight',
  'POPULAR' = 'popular',
  'NEW_RELEASE' = 'newRelease',
}

@Entity()
export class CourseDiscovery extends Base {
  @Column({ type: 'smallint', default: 0 })
  sequence: number;

  @Column({ type: 'enum', enum: CourseDiscoveryType })
  type: CourseDiscoveryType;

  @ManyToOne(() => Course, { onDelete: 'CASCADE', eager: true })
  course: Course;
}
