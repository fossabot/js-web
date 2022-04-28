import { Entity, Column, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { EmailNotificationSubCategory } from './EmailNotificationSubCategory.entity';
import { EmailNotificationCategoryKey } from './enum/EmailNotificationCategoryKey.enum';

@Entity()
export class EmailNotificationCategory extends Base {
  @Column({ nullable: false, unique: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: EmailNotificationCategoryKey,
    nullable: false,
    unique: true,
  })
  key!: EmailNotificationCategoryKey;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @OneToMany(
    () => EmailNotificationSubCategory,
    (subCategory) => subCategory.parent,
    { cascade: true },
  )
  subCategories?: EmailNotificationSubCategory[];
}
