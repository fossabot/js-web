import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { Certificate } from './certificate.entity';

@Entity()
@Unique('user_certificate_unique', ['userId', 'certificateId'])
export class UserCertificate extends Base {
  @Column({ nullable: false })
  certificateId!: string;

  @Column({ nullable: false })
  private userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Certificate, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  certificate!: Certificate;

  @Column({ type: 'timestamptz', nullable: false })
  completedDate!: Date;
}
