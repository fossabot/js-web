import { Entity, Column, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { CourseCategory } from './CourseCategory.entity';

export enum CourseSubCategoryKey {
  FACE_TO_FACE = 'faceToFace',
  VIRTUAL = 'virtual',
  SCORM = 'scorm',
  XAPI = 'xAPI',
  VIDEO = 'video',
  AUDIO = 'audio',
  LINK = 'link',
  ASSESSMENT = 'assessment',
  QUIZ = 'quiz',
  SURVEY = 'survey',
  DOCUMENT = 'document',
  PICTURE = 'picture',
}

@Entity()
export class CourseSubCategory extends Base {
  @Column({ nullable: false })
  name!: string;

  @Column({
    type: 'enum',
    enum: CourseSubCategoryKey,
    nullable: false,
    unique: true,
  })
  key!: CourseSubCategoryKey;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @ManyToOne(() => CourseCategory, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  courseCategory: CourseCategory;
}
