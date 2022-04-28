import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { CoreCertificateModule } from '@seaccentral/core/dist/certificate/coreCertificate.module';

import { UploadModule } from '../upload/upload.module';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { CertificateUnlockRuleService } from './certificateUnlockRule.service';
import { CertificateUnlockRuleController } from './certificateUnlockRule.controller';
import { CourseModule } from '../course/course.module';
import { LearningTrackModule } from '../learning-track/learningTrack.module';

@Module({
  imports: [
    CoreCertificateModule,
    CourseModule,
    LearningTrackModule,
    UploadModule,
    UsersModule,
    CourseEntityModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  controllers: [CertificateController, CertificateUnlockRuleController],
  providers: [CertificateService, CertificateUnlockRuleService],
  exports: [CertificateService, CertificateUnlockRuleService],
})
export class CertificateModule {}
