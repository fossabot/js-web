import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { Base } from '../base/Base.entity';
import { LearningTrack } from '../learning-track/LearningTrack.entity';
import { CertificateUnlockRule } from './CertificateUnlockRule.entity';

@Entity()
@Unique('certificate_unlock_rule_learning_track_item_unique', [
  'unlockRule',
  'learningTrack',
])
export class CertificateUnlockRuleLearningTrackItem extends Base {
  @Column({ nullable: false })
  unlockRuleId!: string;

  @Column({ nullable: false })
  learningTrackId!: string;

  @ManyToOne(() => CertificateUnlockRule, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  unlockRule!: CertificateUnlockRule;

  @ManyToOne(() => LearningTrack, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  learningTrack!: LearningTrack;
}
