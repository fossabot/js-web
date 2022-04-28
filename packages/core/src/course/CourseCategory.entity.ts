import { Entity, Column, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { CourseSubCategory } from './CourseSubCategory.entity';

export enum CourseCategoryKey {
  LEARNING_EVENT = 'learningEvent',
  ONLINE_LEARNING = 'onlineLearning',
  ASSESSMENT = 'assessment',
  MATERIAL = 'material',
}

@Entity()
export class CourseCategory extends Base {
  @Column({ nullable: false, unique: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: CourseCategoryKey,
    nullable: false,
    unique: true,
  })
  key!: CourseCategoryKey;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @OneToMany(
    () => CourseSubCategory,
    (courseSubCategory) => courseSubCategory.courseCategory,
    { cascade: true },
  )
  courseSubCategory?: CourseSubCategory[];
}
