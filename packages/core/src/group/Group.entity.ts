import { Entity, Column, Tree, TreeChildren, TreeParent } from 'typeorm';

import { Base } from '../base/Base.entity';

@Entity()
@Tree('closure-table')
export class Group extends Base {
  @Column({ nullable: true })
  parentId?: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  instancyId: number | null;

  @Column({ default: false })
  isInstancy: boolean;

  @TreeChildren()
  children: Group[];

  @TreeParent()
  parent: Group;

  @Column({ default: false })
  showOnlySubscribedCourses: boolean;

  @Column({ default: false })
  disableUpgrade: boolean;
}
