import { Entity, Column } from 'typeorm';

import { Base } from '../base/Base.entity';

@Entity()
export class EmailFormat extends Base {
  @Column({ type: 'varchar', length: 255 })
  formatName: string;

  @Column({ type: 'varchar', length: 255 })
  teamName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  headerImageKey?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  footerImageKey?: string | null;

  @Column({ type: 'text', nullable: true })
  footerText?: string | null;

  @Column({ type: 'text', nullable: true })
  footerHTML?: string | null;

  @Column({ type: 'text', nullable: true })
  copyrightText?: string | null;

  @Column({ default: false })
  isDefault: boolean;
}
