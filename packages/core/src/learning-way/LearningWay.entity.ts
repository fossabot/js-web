import {
  Column,
  Entity,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
  Unique,
} from 'typeorm';
import { Base } from '../base/Base.entity';

export enum LearningWayKey {
  FRONTLINE = 'frontLine',
  BEELINE = 'beeLine',
  ONLINE = 'onLine',
  INLINE = 'inLine',
}

@Entity()
@Unique('learning_way_unique', ['name', 'isActive'])
@Tree('closure-table')
export class LearningWay extends Base {
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'enum',
    enum: LearningWayKey,
    nullable: true,
  })
  key?: LearningWayKey;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @TreeChildren()
  children?: LearningWay[];

  @TreeParent()
  parent?: LearningWay;
}
