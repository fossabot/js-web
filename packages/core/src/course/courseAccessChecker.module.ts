import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordSetting } from '../admin/Password.setting.entity';
import { CoreGroupModule } from '../group/coreGroup.module';
import { LearningTrackAccessCheckerModule } from '../learning-track/learningTrackAccessChecker.module';
import { OrganizationUser } from '../organization/OrganizationUser.entity';
import { Subscription } from '../payment/Subscription.entity';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';
import { User } from '../user/User.entity';
import { UsersModule } from '../user/users.module';
import { CourseAccessCheckerService } from './courseAccessCheckerService.service';
import { CourseEntityModule } from './courseEntity.module';

@Module({
  imports: [
    CoreGroupModule,
    CourseEntityModule,
    UsersModule,
    LearningTrackAccessCheckerModule,

    TypeOrmModule.forFeature([
      PasswordSetting,
      User,
      Subscription,
      SubscriptionPlan,
      OrganizationUser,
    ]),
  ],
  providers: [CourseAccessCheckerService],
  exports: [CourseAccessCheckerService, TypeOrmModule],
})
export class CourseAccessCheckerModule {}
