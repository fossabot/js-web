import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Topic } from '../topic/Topic.entity';
import { CatalogMenu } from './CatalogMenu.entity';

@Entity()
export class CatalogMenuTopic extends Base {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'smallint', default: 0 })
  sequence: number;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE', eager: true })
  topic: Topic;

  @ManyToOne(() => CatalogMenu, { onDelete: 'CASCADE' })
  menu: CatalogMenu;
}
