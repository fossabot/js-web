import { Entity, Column, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Language } from '../language/Language.entity';
import { NotificationReceiverRole } from './enum/NotificationReceiverRole.enum';
import { INotificationVariable } from './interface/INotificationVariable';
import { NotificationTriggerType } from './NotificationTriggerType.entity';
import { PushNotificationSubCategory } from './PushNotificationSubCategory.entity';

@Entity()
@Unique('push_notification_unique', ['categoryId'])
export class PushNotification extends Base {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  content?: Language | null;

  @ManyToOne(() => NotificationTriggerType, {
    nullable: false,
    eager: true,
  })
  triggerType!: NotificationTriggerType;

  @Column({ nullable: false })
  private categoryId!: string;

  @ManyToOne(() => PushNotificationSubCategory, {
    nullable: false,
    eager: true,
  })
  category!: PushNotificationSubCategory;

  @Column({
    type: 'enum',
    array: true,
    enum: NotificationReceiverRole,
    nullable: false,
    default: [NotificationReceiverRole.LEARNER],
  })
  receiverRoles!: string[];

  @Column({ type: 'jsonb', default: [] })
  availableVariables: INotificationVariable[];
}
