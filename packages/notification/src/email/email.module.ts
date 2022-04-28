import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntityModule } from '@seaccentral/core/dist/course/courseEntity.module';
import { UserAssignedCourse } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { Invitation } from '@seaccentral/core/dist/invitation/Invitation.entity';
import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { UserEmailNotification } from '@seaccentral/core/dist/notification/UserEmailNotification.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ActivateAccountReminder } from './schedule/activateAccountReminder';
import { BookingAfterInactiveReminder } from './schedule/bookingAfterInactiveReminder';
import { BookingSessionReminder } from './schedule/bookingSessionReminder';
import { CompleteAssignedLearningTrackReminder } from './schedule/completeAssignedLearningTrackReminder';
import { CompleteRequiredCourseReminder } from './schedule/completeRequiredCourseReminder';
import { DoAssessmentReminder } from './schedule/doAssessmentReminder';
import { SubscriptionExpirationReminder } from './schedule/subscriptionExpirationReminder';
import { UserEmailNotificationController } from './userEmailNotification.controller';
import { UserEmailNotificationService } from './userEmailNotification.service';

@Module({
  imports: [
    QueueModule,
    UsersModule,
    CourseEntityModule,
    TypeOrmModule.forFeature([
      EmailNotification,
      Subscription,
      UserAssignedLearningTrack,
      UserEmailNotification,
      UserAssignedCourse,
      Invitation,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  controllers: [EmailController, UserEmailNotificationController],
  providers: [
    EmailService,
    UserEmailNotificationService,
    SubscriptionExpirationReminder,
    CompleteAssignedLearningTrackReminder,
    BookingAfterInactiveReminder,
    DoAssessmentReminder,
    BookingSessionReminder,
    ActivateAccountReminder,
    CompleteRequiredCourseReminder,
  ],
  exports: [EmailService, UserEmailNotificationService],
})
export class EmailModule {}
