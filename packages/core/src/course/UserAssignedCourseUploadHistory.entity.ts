import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';
import { UploadProcessStatus } from '../bulk-upload/UploadProcessStatus.enum';

@Entity()
export class UserAssignedCourseUploadHistory extends Base {
  @Column()
  file: string;

  @Column({ default: false, nullable: false })
  isProcessed!: boolean;

  @Column({
    type: 'enum',
    enum: UploadProcessStatus,
    nullable: false,
    default: UploadProcessStatus.PENDING,
  })
  status!: UploadProcessStatus;

  @Index()
  @Column({ nullable: false })
  s3key!: string;

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn()
  uploadedBy!: User;

  @Column({ type: 'text', nullable: true })
  error?: string;
}
