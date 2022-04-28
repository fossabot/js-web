import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';

export enum MediaStatus {
  Created = 'CREATED',
  Available = 'AVAILABLE',
}

@Entity()
export class Media extends Base {
  @Column({ enum: MediaStatus, default: MediaStatus.Created })
  status: MediaStatus;

  @Column({ unique: true })
  jwMediaId: string;

  @ManyToOne(() => User)
  uploader: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'double precision' })
  duration: number;

  @Column()
  filename: string;

  @Column()
  bytes: number;

  @Column()
  mime: string;
}
