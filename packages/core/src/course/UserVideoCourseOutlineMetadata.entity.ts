import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Media } from '../media/media.entity';
import { UserCourseOutlineProgress } from './UserCourseOutlineProgress.entity';

export interface VideoProgressMetadata {
  id: string;
  spentDuration: number;
  totalDuration: number;
  percentage: number;
}

@Entity()
export class UserVideoCourseOutlineMetadata extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Media, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  lastVideo: Media;

  @Column({ type: 'double precision' })
  lastDuration: number;

  @Column({ type: 'jsonb', nullable: false, default: [] })
  videoProgress: VideoProgressMetadata[];

  @ManyToOne(() => UserCourseOutlineProgress, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: false,
  })
  userCourseOutlineProgress: UserCourseOutlineProgress;
}
