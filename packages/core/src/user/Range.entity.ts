/* eslint-disable max-classes-per-file */
import { Entity, Column, TableInheritance, ChildEntity } from 'typeorm';

import { Base } from '../base/Base.entity';

@Entity({
  name: 'range',
})
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class RangeBase extends Base {
  @Column({ type: 'int', nullable: false })
  start: number;

  @Column({ type: 'int', nullable: false })
  end: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nameEn: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nameTh: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;
}

@ChildEntity()
export class AgeRange extends RangeBase {}

@ChildEntity()
export class CompanySizeRange extends RangeBase {}
