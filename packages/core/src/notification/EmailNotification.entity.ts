import { Entity, Column, ManyToOne, Unique, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Language } from '../language/Language.entity';
import { EmailFormat } from './EmailFormat.entity';
import { EmailNotificationSubCategory } from './EmailNotificationSubCategory.entity';
import { EmailNotificationSenderDomain } from './EmailNotificationSenderDomain.entity';
import { NotificationTriggerType } from './NotificationTriggerType.entity';
import { NotificationReceiverRole } from './enum/NotificationReceiverRole.enum';
import { INotificationVariable } from './interface/INotificationVariable';

@Entity()
@Unique('email_notification_unique', ['categoryId'])
export class EmailNotification extends Base {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: false,
    cascade: true,
  })
  subject!: Language;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  bodyHTML?: Language | null;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  bodyText?: Language | null;

  @ManyToOne(() => NotificationTriggerType, {
    nullable: false,
    eager: true,
  })
  triggerType!: NotificationTriggerType;

  @Column({ nullable: false })
  private categoryId!: string;

  @ManyToOne(() => EmailNotificationSubCategory, {
    nullable: false,
    eager: true,
  })
  category: EmailNotificationSubCategory;

  @ManyToOne(() => EmailFormat, {
    nullable: false,
    eager: true,
  })
  emailFormatEn!: EmailFormat;

  @ManyToOne(() => EmailFormat, {
    nullable: false,
    eager: true,
  })
  emailFormatTh!: EmailFormat;

  @Column({ type: 'varchar', length: 100, nullable: false })
  senderEmailUser: string;

  @ManyToOne(() => EmailNotificationSenderDomain, {
    nullable: false,
    eager: true,
  })
  senderEmailDomain!: EmailNotificationSenderDomain;

  @Column({
    type: 'enum',
    array: true,
    enum: NotificationReceiverRole,
    nullable: false,
    default: [NotificationReceiverRole.LEARNER],
  })
  receiverRoles!: NotificationReceiverRole[];

  @Column({ type: 'jsonb', default: [] })
  availableVariables: INotificationVariable[];
}
