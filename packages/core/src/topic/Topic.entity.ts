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

@Entity()
@Unique('topic_unique', ['name', 'isActive'])
@Tree('closure-table')
export class Topic extends Base {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @TreeChildren()
  children?: Topic[];

  @TreeParent()
  parent?: Topic;
}
