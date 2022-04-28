import { Entity, Column } from 'typeorm';

import { Base } from '../base/Base.entity';

@Entity()
export class Industry extends Base {
  @Column({ type: 'varchar', length: 255, nullable: false })
  nameEn: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nameTh: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;
}
