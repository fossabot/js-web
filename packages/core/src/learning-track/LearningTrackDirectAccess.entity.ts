import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { LearningTrack } from './LearningTrack.entity';

export enum LearningTrackDirectAccessorType {
  User = 'user',
  Group = 'group',
  Organization = 'organization',
}

@Entity()
export class LearningTrackDirectAccess extends Base {
  @ManyToOne(() => LearningTrack, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  learningTrack: LearningTrack;

  // This id can reference user.entity, group.entity or an organization.entity.
  // Since we can't actually apply polymorphism here, we cannot check referential integrity in this case.
  // But we can programatically know the what the id represents by looking into accessor type.
  @Column({ nullable: false, type: 'uuid' })
  accessorId!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: LearningTrackDirectAccessorType,
    nullable: false,
  })
  accessorType!: LearningTrackDirectAccessorType;

  @Column({ type: 'timestamptz', nullable: false })
  expiryDateTime!: Date;
}
