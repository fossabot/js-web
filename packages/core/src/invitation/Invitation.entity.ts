import { Entity, Column, Index, Check, ManyToOne } from 'typeorm';

import { Role } from '../user/Role.entity';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { EMAIL_PATTERN } from '../utils/constants';
import { Organization } from '../organization/Organization.entity';

@Entity()
@Index('invitation_token_search_index', ['token'])
export class Invitation extends Base {
  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName: string;

  @Column({ type: 'citext', nullable: false })
  @Index('invitation_email_unique_index', { unique: true })
  @Check('invitation_email_check', `email ~* '${EMAIL_PATTERN}'`)
  email: string;

  @Column({ type: 'uuid', nullable: false, unique: true })
  token: string;

  @ManyToOne(() => Role, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  role: Role;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  invitedBy: User;

  @ManyToOne(() => Organization, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  organization?: Organization;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date;
}
