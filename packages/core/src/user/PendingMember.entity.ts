import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from './User.entity';
import { Organization } from '../organization/Organization.entity';

@Entity()
@Unique('user_unique', ['userId'])
export class PendingMember extends Base {
  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  user: User;

  @Column({ type: 'timestamptz' })
  activationDate: Date;

  @Column({ nullable: true })
  organizationId?: string | null;

  @ManyToOne(() => Organization, { nullable: true, eager: true })
  organization?: Organization | null;
}
