import { QueueModule } from '@seaccentral/core/dist/queue/queue.module';
import { Module } from '@nestjs/common';
import { NotificationEntityModule } from '@seaccentral/core/dist/notification/NotificationEntity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSessionBooking } from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';
import { UserAssignedCourse } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';
import { UpcomingBookingReminder } from './upcomingBooking.reminder';
import { MembershipExpiringReminder } from './membershipExpiring.reminder';
import { AssignedCourseReminder } from './assignedCourse.reminder';
import { AssignedLearningTrackReminder } from './assignedLearningTrack.reminder';
import { PreAssessmentReminder } from './preAssessment.reminder';

@Module({
  imports: [
    QueueModule,
    NotificationEntityModule,
    TypeOrmModule.forFeature([
      CourseSessionBooking,
      Subscription,
      UserAssignedCourse,
      UserAssignedLearningTrack,
    ]),
  ],
  providers: [
    UpcomingBookingReminder,
    MembershipExpiringReminder,
    AssignedCourseReminder,
    AssignedLearningTrackReminder,
    PreAssessmentReminder,
  ],
})
export class NotificationReminderModule {}
