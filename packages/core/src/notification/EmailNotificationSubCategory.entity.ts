import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { EmailNotification } from './EmailNotification.entity';
import { EmailNotificationCategory } from './EmailNotificationCategory.entity';
import { EmailNotificationSubCategoryKey } from './enum/EmailNotificationSubCategory.enum';

@Entity()
export class EmailNotificationSubCategory extends Base {
  @Column({ nullable: false, unique: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: EmailNotificationSubCategoryKey,
    nullable: false,
    unique: true,
  })
  key!: EmailNotificationSubCategoryKey;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ nullable: false })
  private parentId!: string;

  @ManyToOne(() => EmailNotificationCategory, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  parent: EmailNotificationCategory;

  @OneToMany(
    () => EmailNotification,
    (emailNotification) => emailNotification.category,
    { cascade: true },
  )
  notifications!: EmailNotification[];
}
