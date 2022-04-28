import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Media } from '../media/media.entity';
import { CourseOutline } from './CourseOutline.entity';

@Entity()
@Unique('course_outline_media_unique', ['courseOutline', 'media'])
export class CourseOutlineMediaPlayList extends Base {
  @Column({ nullable: false })
  private courseOutlineId!: string;

  @Column({ nullable: false })
  private mediaId!: string;

  @Column({ nullable: false })
  sequence!: number;

  @ManyToOne(() => CourseOutline, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  courseOutline!: CourseOutline;

  @ManyToOne(() => Media, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  media!: Media;
}
