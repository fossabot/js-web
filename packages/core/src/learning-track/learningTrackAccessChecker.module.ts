import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordSetting } from '../admin/Password.setting.entity';
import { CoreGroupModule } from '../group/coreGroup.module';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { User } from '../user/User.entity';
import { UsersModule } from '../user/users.module';
import { LearningTrackAccessCheckerService } from './learningTrackAccessCheckerService.service';
import { LearningTrackEntityModule } from './learningTrackEntity.module';

@Module({
  imports: [
    CoreGroupModule,
    LearningTrackEntityModule,
    UsersModule,

    TypeOrmModule.forFeature([PasswordSetting, User, OrganizationUser]),
  ],
  providers: [LearningTrackAccessCheckerService],
  exports: [LearningTrackAccessCheckerService, TypeOrmModule],
})
export class LearningTrackAccessCheckerModule {}
