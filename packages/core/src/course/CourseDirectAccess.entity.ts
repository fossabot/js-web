import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Course } from './Course.entity';

export enum CourseDirectAccessorType {
  User = 'user',
  Group = 'group',
  Organization = 'organization',
}

@Entity()
export class CourseDirectAccess extends Base {
  @ManyToOne(() => Course, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  course: Course;

  // This id can reference user.entity, group.entity or an organization.entity.
  // Since we can't actually apply polymorphism here, we cannot check referential integrity in this case.
  // But we can programatically know the what the id represents by looking into accessor type.
  @Column({ nullable: false, type: 'uuid' })
  accessorId!: string;

  @Index()
  @Column({ type: 'enum', enum: CourseDirectAccessorType, nullable: false })
  accessorType!: CourseDirectAccessorType;

  @Column({ type: 'timestamptz', nullable: false })
  expiryDateTime!: Date;
}
