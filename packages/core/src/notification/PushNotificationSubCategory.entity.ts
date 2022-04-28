import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { PushNotificationSubCategoryKey } from './enum/PushNotificationSubCategory.enum';
import { PushNotification } from './PushNotification.entity';
import { PushNotificationCategory } from './PushNotificationCategory.entity';

@Entity()
export class PushNotificationSubCategory extends Base {
  @Column({ nullable: false, unique: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: PushNotificationSubCategoryKey,
    nullable: false,
    unique: true,
  })
  key!: PushNotificationSubCategoryKey;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ nullable: false })
  private parentId!: string;

  @ManyToOne(() => PushNotificationCategory, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  parent!: PushNotificationCategory;

  @OneToMany(
    () => PushNotification,
    (pushNotification) => pushNotification.category,
    { cascade: true },
  )
  notifications!: PushNotification[];
}
