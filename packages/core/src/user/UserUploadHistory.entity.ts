import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from './User.entity';
import { UserUploadType } from './UserUploadType.enum';

export enum UserUploadProcessStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class UserUploadHistory extends Base {
  @Column()
  file: string;

  @Column({ default: false })
  isProcessed?: boolean;

  @Column({
    type: 'enum',
    enum: UserUploadProcessStatus,
    nullable: false,
    default: UserUploadProcessStatus.PENDING,
  })
  status!: UserUploadProcessStatus;

  @Column({ nullable: true })
  s3key: string;

  @Column({ type: 'enum', enum: UserUploadType, nullable: false })
  uploadType: UserUploadType;

  @Column({ nullable: true })
  organizationId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'created_by' })
  user!: User;
}
