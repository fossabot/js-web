import { Entity, OneToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Language } from '../language/Language.entity';
import { CatalogMenuLearningWay } from './CatalogMenuLearningWay.entity';
import { CatalogMenuTopic } from './CatalogMenuTopic.entity';

@Entity()
export class CatalogMenu extends Base {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Language, { eager: true })
  topicHeadline: Language;

  @ManyToOne(() => Language, { eager: true })
  learningWayHeadline: Language;

  @OneToMany(() => CatalogMenuTopic, (menuItem) => menuItem.menu)
  menuTopics: CatalogMenuTopic[];

  @OneToMany(() => CatalogMenuLearningWay, (menuItem) => menuItem.menu)
  menuLearningWays: CatalogMenuLearningWay[];
}
