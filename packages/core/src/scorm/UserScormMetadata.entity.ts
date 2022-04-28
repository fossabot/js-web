import { Column, Entity, JoinColumn, OneToOne, Unique } from 'typeorm';
import { UserCourseOutlineProgress } from '../course/UserCourseOutlineProgress.entity';
import { Base } from '../base/Base.entity';
import { ScormVersion } from './ScormVersion.enum';

@Entity()
@Unique('user_scorm_metadata_unique', ['userCourseOutlineProgress'])
export class UserScormMetadata extends Base {
  @Column({
    type: 'jsonb',
    default: {},
  })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 200, default: '' })
  status: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  location: string;

  @Column({ type: 'text', default: '' })
  suspend_data: string;

  @Column({ type: 'enum', enum: ScormVersion, nullable: true })
  version?: ScormVersion | null;

  @OneToOne(() => UserCourseOutlineProgress, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userCourseOutlineProgressId' })
  userCourseOutlineProgress!: UserCourseOutlineProgress;
}
