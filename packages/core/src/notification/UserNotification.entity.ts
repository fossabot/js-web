import { Entity, ManyToOne, Unique, Column } from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { PushNotification } from './PushNotification.entity';

export interface IUserNotificationVariables {
  [key: string]: any;
}

@Entity()
@Unique('user_notification_unique', ['userId', 'notificationId', 'notifyDate'])
export class UserNotification extends Base {
  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ nullable: false })
  notificationId!: string;

  @ManyToOne(() => PushNotification, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  notification!: PushNotification;

  @Column({ nullable: false, default: false })
  isRead: boolean;

  @Column({ type: 'timestamptz', nullable: false })
  notifyDate!: Date;

  @Column({ type: 'jsonb' })
  variables: IUserNotificationVariables;
}
