import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { LearningWay } from '../learning-way/LearningWay.entity';
import { CatalogMenu } from './CatalogMenu.entity';

@Entity()
export class CatalogMenuLearningWay extends Base {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'smallint', default: 0 })
  sequence: number;

  @ManyToOne(() => LearningWay, { onDelete: 'CASCADE', eager: true })
  learningWay: LearningWay;

  @ManyToOne(() => CatalogMenu, { onDelete: 'CASCADE' })
  menu: CatalogMenu;
}
