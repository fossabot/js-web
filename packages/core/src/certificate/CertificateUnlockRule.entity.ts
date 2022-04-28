import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import { Certificate } from './certificate.entity';
import { CertificationType } from './certificate.enum';
import { CertificateUnlockRuleCourseItem } from './CertificateUnlockRuleCourseItem.entity';
import { CertificateUnlockRuleLearningTrackItem } from './CertificateUnlockRuleLearningTrackItem.entity';

@Entity()
export class CertificateUnlockRule extends Base {
  @Column({ nullable: false })
  certificateId!: string;

  @Column({ nullable: false })
  ruleName!: string;

  @Index()
  @Column({ type: 'enum', enum: CertificationType, nullable: false })
  unlockType!: CertificationType;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy!: User;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  lastModifiedBy!: User;

  @ManyToOne(() => Certificate, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  certificate!: Certificate;

  @OneToMany(
    () => CertificateUnlockRuleCourseItem,
    (certificateUnlockRuleCourseItem) =>
      certificateUnlockRuleCourseItem.unlockRule,
    { cascade: true, orphanedRowAction: 'delete' },
  )
  courseRuleItems: CertificateUnlockRuleCourseItem[];

  @OneToMany(
    () => CertificateUnlockRuleLearningTrackItem,
    (certificateUnlockRuleLearningTrackItem) =>
      certificateUnlockRuleLearningTrackItem.unlockRule,
    { cascade: true, orphanedRowAction: 'delete' },
  )
  learningTrackRuleItems: CertificateUnlockRuleLearningTrackItem[];
}
