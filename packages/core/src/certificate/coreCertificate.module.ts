import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Certificate } from './certificate.entity';
import { UserCertificate } from './UserCertificate.entity';
import { CertificateUnlockRule } from './CertificateUnlockRule.entity';
import { CertificateUnlockRuleCourseItem } from './CertificateUnlockRuleCourseItem.entity';
import { CertificateUnlockRuleLearningTrackItem } from './CertificateUnlockRuleLearningTrackItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Certificate,
      UserCertificate,
      CertificateUnlockRule,
      CertificateUnlockRuleCourseItem,
      CertificateUnlockRuleLearningTrackItem,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CoreCertificateModule {}
