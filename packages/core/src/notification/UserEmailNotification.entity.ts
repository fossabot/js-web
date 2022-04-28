import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';

@Entity()
export class UserEmailNotification extends Base {
  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: false })
  subject!: string;

  @Column({ type: 'text', nullable: false })
  html!: string;

  @Column({ type: 'text', nullable: false })
  text!: string;

  @Column({ nullable: false })
  category!: string;

  @Column({ nullable: false })
  from!: string;

  @Column()
  awsMessageId: string;
}
