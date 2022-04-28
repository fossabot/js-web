import { Entity, Column, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Language } from '../language/Language.entity';

@Entity()
export class SystemAnnouncement extends Base {
  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  title?: Language | null;

  @ManyToOne(() => Language, {
    eager: true,
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  message?: Language | null;

  @Column({ type: 'timestamptz', nullable: true })
  messageStartDateTime?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  messageEndDateTime?: Date | null;

  @Column({ type: 'date', nullable: false })
  startDate!: Date;

  @Column({ type: 'date', nullable: false })
  endDate!: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  imageKey?: string | null;
}
