import { Entity, Column, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { PushNotificationCategoryKey } from './enum/PushNotificationCategory.enum';
import { PushNotificationSubCategory } from './PushNotificationSubCategory.entity';

@Entity()
export class PushNotificationCategory extends Base {
  @Column({ nullable: false, unique: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: PushNotificationCategoryKey,
    nullable: false,
    unique: true,
  })
  key!: PushNotificationCategoryKey;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @OneToMany(
    () => PushNotificationSubCategory,
    (subCategory) => subCategory.parent,
    { cascade: true },
  )
  subCategories?: PushNotificationSubCategory[];
}
