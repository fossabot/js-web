import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { LearningTrack } from './LearningTrack.entity';
import { BaseMaterial } from '../material/material.entity';

@Entity()
@Unique('learning_track_material_unique', ['material', 'learningTrack'])
export class LearningTrackMaterial extends Base {
  @Column({ nullable: false })
  private learningTrackId!: string;

  @Column({ nullable: false })
  private materialId!: string;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  learningTrack!: LearningTrack;

  @ManyToOne(() => BaseMaterial, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  material!: BaseMaterial;
}
