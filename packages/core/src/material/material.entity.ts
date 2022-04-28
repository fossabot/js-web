/* eslint-disable max-classes-per-file */

import {
  ChildEntity,
  Column,
  Entity,
  ManyToOne,
  TableInheritance,
} from 'typeorm';
import { User } from '../user/User.entity';
import { Base } from '../base/Base.entity';

export enum MaterialType {
  MATERIAL_INTERNAL = 'MaterialInternal',
  MATERIAL_EXTERNAL = 'MaterialExternal',
}

@Entity('material')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class BaseMaterial extends Base {
  @Column()
  readonly type: MaterialType;

  @Column()
  displayName: string;

  @Column({ type: 'text', nullable: true })
  language: string | null;

  @ManyToOne(() => User, { eager: true })
  uploader: User;
}

@ChildEntity()
export class MaterialInternal extends BaseMaterial {
  @Column({ default: 'application/octet-stream' })
  mime: string;

  @Column()
  filename: string;

  @Column()
  key: string;

  @Column()
  bytes: number;

  @Column()
  hash: string;
}

@ChildEntity()
export class MaterialExternal extends BaseMaterial {
  @Column()
  url: string;
}
