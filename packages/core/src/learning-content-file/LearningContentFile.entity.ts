import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';

@Entity()
export class LearningContentFile extends Base {
  @Column({ default: 'application/octet-stream' })
  mime: string;

  @Column()
  filename: string;

  @Column()
  key: string;

  @Column()
  bytes: number;

  @Column()
  hash: string;

  @Column({ type: 'text', nullable: true })
  language: string | null;

  @ManyToOne(() => User, { eager: true })
  uploader: User;
}
