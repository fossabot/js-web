import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { UserUploadHistory } from '@seaccentral/core/dist/user/UserUploadHistory.entity';
import { FileImportHistory } from '@seaccentral/core/dist/file-import/FileImportHistory.entity';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { ExternalProviderModule } from '@seaccentral/core/dist/external-package-provider/external.provider.module';

import { PendingMember } from '@seaccentral/core/dist/user/PendingMember.entity';
import { TaskService } from './task.service';
import { SearchModule } from '../search/search.module';
import { CourseModule } from '../course/course.module';
import { CertificateModule } from '../certificate/certificate.module';
import { LearningTrackModule } from '../learning-track/learningTrack.module';
import { PendingMemberService } from './pendingMember.service';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [
    UsersModule,
    ExternalProviderModule,
    SearchModule,
    CourseModule,
    LearningTrackModule,
    CertificateModule,
    WebhookModule,
    TypeOrmModule.forFeature([
      UserAuthProvider,
      UserUploadHistory,
      Organization,
      PasswordSetting,
      FileImportHistory,
      CourseSessionBooking,
      PendingMember,
    ]),
  ],
  providers: [TaskService, PendingMemberService],
})
export class TaskModule {}
