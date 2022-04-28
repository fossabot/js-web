import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Course } from './Course.entity';
import { BaseMaterial } from '../material/material.entity';

@Entity()
@Unique('course_material_unique', ['material', 'course'])
export class CourseMaterial extends Base {
  @Column({ nullable: false })
  private courseId!: string;

  @Column({ nullable: false })
  private materialId!: string;

  @ManyToOne(() => Course, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  course!: Course;

  @ManyToOne(() => BaseMaterial, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  material!: BaseMaterial;
}
