/**
 * https://documenter.getpostman.com/view/4991586/U16htmko
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailFormat } from '../notification/EmailFormat.entity';
import { EmailNotification } from '../notification/EmailNotification.entity';
import { EmailNotificationCategory } from '../notification/EmailNotificationCategory.entity';
import { EmailNotificationSenderDomain } from '../notification/EmailNotificationSenderDomain.entity';
import { EmailNotificationSubCategory } from '../notification/EmailNotificationSubCategory.entity';
import { EmailNotificationCategoryKey } from '../notification/enum/EmailNotificationCategoryKey.enum';
import { EmailNotificationSubCategoryKey } from '../notification/enum/EmailNotificationSubCategory.enum';
import { NotificationReceiverRole } from '../notification/enum/NotificationReceiverRole.enum';
import { PushNotificationCategoryKey } from '../notification/enum/PushNotificationCategory.enum';
import { PushNotificationSubCategoryKey } from '../notification/enum/PushNotificationSubCategory.enum';
import { NotificationTriggerType } from '../notification/NotificationTriggerType.entity';
import { PushNotification } from '../notification/PushNotification.entity';
import { PushNotificationCategory } from '../notification/PushNotificationCategory.entity';
import { PushNotificationSubCategory } from '../notification/PushNotificationSubCategory.entity';
import {
  EmailFormatSeedData,
  EmailNotificationSeedData,
} from '../notification/seed-data/EmailNotificationSeedData';
import { PushNotificationSeedData } from '../notification/seed-data/PushNotificationSeedData';

@Injectable()
export class NotificationSeedService {
  constructor(
    @InjectRepository(PushNotification)
    private readonly pushNotificationRepository: Repository<PushNotification>,
    @InjectRepository(PushNotificationCategory)
    private readonly pushNotificationCategoryRepository: Repository<PushNotificationCategory>,
    @InjectRepository(PushNotificationSubCategory)
    private readonly pushNotificationSubCategoryRepository: Repository<PushNotificationSubCategory>,
    @InjectRepository(EmailNotificationCategory)
    private readonly emailNotificationCategoryRepository: Repository<EmailNotificationCategory>,
    @InjectRepository(EmailNotificationSubCategory)
    private readonly emailNotificationSubCategoryRepository: Repository<EmailNotificationSubCategory>,
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(EmailFormat)
    private readonly emailFormatRepository: Repository<EmailFormat>,
    @InjectRepository(EmailNotificationSenderDomain)
    private readonly emailNotificationSenderDomainRepository: Repository<EmailNotificationSenderDomain>,
    @InjectRepository(NotificationTriggerType)
    private readonly notificationTriggerTypeRepository: Repository<NotificationTriggerType>,
  ) {}

  async seedTriggerTypes() {
    const triggerTypes = [
      { displayName: 'Immediately', triggerSeconds: [0] },
      {
        displayName: '30, 15, 7 days before expiry/due date',
        triggerSeconds: [-2592000, -1296000, -604800],
      },
      {
        displayName: '7, 1 days before expiry/due date',
        triggerSeconds: [-604800, -86400],
      },
      {
        displayName: '2 days before expiry/due date',
        triggerSeconds: [-172800],
      },
      { displayName: '7 days after expiry/due date', triggerSeconds: [604800] },
      { displayName: '3 days after expiry/due date', triggerSeconds: [259200] },
      {
        displayName: '7 days before expiry/due date',
        triggerSeconds: [-604800],
      },
    ];
    await this.notificationTriggerTypeRepository.upsert(triggerTypes, {
      conflictPaths: ['displayName', 'triggerSeconds'],
    });
  }

  async seedPushNotifications() {
    const one = await this.pushNotificationCategoryRepository.findOne();
    if (one) return;

    const immediatelyTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: 'Immediately',
      });
    const thirtyDaysBeforeTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '30, 15, 7 days before expiry/due date',
      });
    const sevenDaysBeforeTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '7, 1 days before expiry/due date',
      });
    const twoDaysBeforeTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '2 days before expiry/due date',
      });

    const categories = [
      {
        name: 'Assignment',
        key: PushNotificationCategoryKey.ASSIGNMENT,
        subCategories: this.pushNotificationSubCategoryRepository.create([
          {
            name: 'Assignment to course',
            key: PushNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Assignment to course',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Assignment to learning track',
            key: PushNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Assignment to learning track',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Assignment to session',
            key: PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Assignment to session',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'Certificate',
        key: PushNotificationCategoryKey.CERTIFICATE,
        subCategories: this.pushNotificationSubCategoryRepository.create([
          {
            name: 'Certificate unlocked',
            key: PushNotificationSubCategoryKey.CERTIFICATE_UNLOCKED,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Certificate unlocked',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'Learning Activity',
        key: PushNotificationCategoryKey.LEARNING_ACTIVITY,
        subCategories: this.pushNotificationSubCategoryRepository.create([
          {
            name: 'Booking cancelled by admin',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Booking cancelled by admin',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_ADMIN
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Booking cancelled by user',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Booking cancelled by user',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_BOOKING_CANCELLED_BY_USER
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Session cancelled by admin',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Session cancelled by admin',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_SESSION_CANCELLED_BY_ADMIN
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Course completion',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_COMPLETION,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Course completion',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_COURSE_COMPLETION
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_COURSE_COMPLETION
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Course enrollment',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_ENROLLMENT,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Course enrollment',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_COURSE_ENROLLMENT
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_COURSE_ENROLLMENT
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Learning Track completion',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_COMPLETION,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Learning Track completion',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_LEARNING_TRACK_COMPLETION
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_LEARNING_TRACK_COMPLETION
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Learning Track enrollment',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_ENROLLMENT,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Learning Track enrollment',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_LEARNING_TRACK_ENROLLMENT
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_LEARNING_TRACK_ENROLLMENT
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Session booked',
            key: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_SESSION_BOOKED,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Session booked',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_SESSION_BOOKED
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .LEARNING_ACTIVITY_SESSION_BOOKED
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'Membership',
        key: PushNotificationCategoryKey.MEMBERSHIP,
        subCategories: this.pushNotificationSubCategoryRepository.create([
          {
            name: 'Membership activated',
            key: PushNotificationSubCategoryKey.MEMBERSHIP_ACTIVATED,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Membership activated',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.MEMBERSHIP_ACTIVATED
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.MEMBERSHIP_ACTIVATED
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Membership expiring reminder',
            key: PushNotificationSubCategoryKey.MEMBERSHIP_EXPIRING_REMINDER,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Membership expiry reminder',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .MEMBERSHIP_EXPIRING_REMINDER
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .MEMBERSHIP_EXPIRING_REMINDER
                    ].th,
                },
                triggerType: thirtyDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Membership renewal',
            key: PushNotificationSubCategoryKey.MEMBERSHIP_RENEWAL,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Membership renewal',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.MEMBERSHIP_RENEWAL
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.MEMBERSHIP_RENEWAL
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'Reminder',
        key: PushNotificationCategoryKey.REMINDER,
        subCategories: this.pushNotificationSubCategoryRepository.create([
          {
            name: 'Assessment result required',
            key: PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_RESULT_REQUIRED,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Assessment result required',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_ASSESSMENT_RESULT_REQUIRED
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_ASSESSMENT_RESULT_REQUIRED
                    ].th,
                },
                triggerType: sevenDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Assessment unlocked',
            key: PushNotificationSubCategoryKey.REMINDER_ASSESSMENT_UNLOCKED,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Assessment unlocked',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_ASSESSMENT_UNLOCKED
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_ASSESSMENT_UNLOCKED
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Complete required course',
            key: PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_COURSE,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Complete required course',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_COMPLETE_REQUIRED_COURSE
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_COMPLETE_REQUIRED_COURSE
                    ].th,
                },
                triggerType: thirtyDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Complete required learning track',
            key: PushNotificationSubCategoryKey.REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Complete required learning track',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_COMPLETE_REQUIRED_LEARNING_TRACK
                    ].th,
                },
                triggerType: thirtyDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Upcoming booked events',
            key: PushNotificationSubCategoryKey.REMINDER_UPCOMING_BOOKED_EVENTS,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'Upcoming booked events',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_UPCOMING_BOOKED_EVENTS
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey
                        .REMINDER_UPCOMING_BOOKED_EVENTS
                    ].th,
                },
                triggerType: twoDaysBeforeTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'System Announcement',
        key: PushNotificationCategoryKey.SYSTEM_ANNOUNCEMENT,
        subCategories: this.pushNotificationSubCategoryRepository.create([
          {
            name: 'System Announcement',
            key: PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT,
            notifications: this.pushNotificationRepository.create([
              {
                title: 'System Announcement',
                content: {
                  nameEn:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT
                    ].en,
                  nameTh:
                    PushNotificationSeedData[
                      PushNotificationSubCategoryKey.SYSTEM_ANNOUNCEMENT
                    ].th,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
    ];

    await this.pushNotificationCategoryRepository.save(categories);
  }

  async seedEmailNotifications() {
    const one = await this.emailNotificationCategoryRepository.findOne();
    if (one) return;

    const immediatelyTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: 'Immediately',
      });
    const thirtyDaysBeforeTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '30, 15, 7 days before expiry/due date',
      });
    const twoDaysBeforeTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '2 days before expiry/due date',
      });
    const sevenDaysBeforeTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '7, 1 days before expiry/due date',
      });
    const sevenDaysAfterTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '7 days after expiry/due date',
      });
    const threeDaysAfterTriggerType =
      await this.notificationTriggerTypeRepository.findOneOrFail({
        displayName: '3 days after expiry/due date',
      });

    let emailFormatEn = await this.emailFormatRepository.findOne({
      formatName: EmailFormatSeedData.en.formatName,
    });
    if (!emailFormatEn) {
      emailFormatEn = await this.emailFormatRepository.save(
        EmailFormatSeedData.en,
      );
    }

    let emailFormatTh = await this.emailFormatRepository.findOne({
      formatName: EmailFormatSeedData.th.formatName,
    });
    if (!emailFormatTh) {
      emailFormatTh = await this.emailFormatRepository.save(
        EmailFormatSeedData.th,
      );
    }

    let senderEmailDomain =
      await this.emailNotificationSenderDomainRepository.findOne();
    if (!senderEmailDomain) {
      senderEmailDomain =
        await this.emailNotificationSenderDomainRepository.save({
          domain: 'yournextu.com',
        });
    }

    const categories = [
      {
        name: 'Assignment',
        key: EmailNotificationCategoryKey.ASSIGNMENT,
        triggerType: immediatelyTriggerType,
        subCategories: this.emailNotificationSubCategoryRepository.create([
          {
            name: 'Assignment to course',
            key: EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Assignment to course',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_COURSE
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Assignment to learning track',
            key: EmailNotificationSubCategoryKey.ASSIGNMENT_TO_LEARNING_TRACK,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Assignment to learning track',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_LEARNING_TRACK
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Assignment to session (F2F)',
            key: EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Assignment to session (F2F)',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_F2F
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Assignment to session (Virtual)',
            key: EmailNotificationSubCategoryKey.ASSIGNMENT_TO_SESSION_VIRTUAL,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Assignment to session (Virtual)',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_SESSION_VIRTUAL
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_SESSION_VIRTUAL
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_SESSION_VIRTUAL
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_SESSION_VIRTUAL
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_SESSION_VIRTUAL
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .ASSIGNMENT_TO_SESSION_VIRTUAL
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'Booking',
        key: EmailNotificationCategoryKey.BOOKING,
        subCategories: this.emailNotificationSubCategoryRepository.create([
          {
            name: 'Booking cancelled',
            key: EmailNotificationSubCategoryKey.BOOKING_CANCELLATION,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Booking cancelled',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CANCELLATION
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Session cancelled by admin',
            key: EmailNotificationSubCategoryKey.BOOKING_CANCELLATION_BY_ADMIN,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Session cancelled by admin',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CANCELLATION_BY_ADMIN
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CANCELLATION_BY_ADMIN
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CANCELLATION_BY_ADMIN
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CANCELLATION_BY_ADMIN
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CANCELLATION_BY_ADMIN
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CANCELLATION_BY_ADMIN
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
                receiverRoles: [
                  NotificationReceiverRole.LEARNER,
                  NotificationReceiverRole.INSTRUCTOR,
                  NotificationReceiverRole.MODERATOR,
                ],
              },
            ]),
          },
          {
            name: 'Booking confirmation (F2F)',
            key: EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Booking confirmation (F2F)',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_F2F
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Booking confirmation (Virtual)',
            key: EmailNotificationSubCategoryKey.BOOKING_CONFIRMATION_VIRTUAL,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Booking confirmation (Virtual)',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CONFIRMATION_VIRTUAL
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CONFIRMATION_VIRTUAL
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CONFIRMATION_VIRTUAL
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CONFIRMATION_VIRTUAL
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CONFIRMATION_VIRTUAL
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .BOOKING_CONFIRMATION_VIRTUAL
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Booking instructor changed',
            key: EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Booking instructor changed',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_INSTRUCTOR_CHANGED
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
                receiverRoles: [
                  NotificationReceiverRole.INSTRUCTOR,
                  NotificationReceiverRole.MODERATOR,
                ],
              },
            ]),
          },
          {
            name: 'Booking schedule changed',
            key: EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Booking schedule changed',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.BOOKING_SCHEDULE_CHANGED
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
                receiverRoles: [
                  NotificationReceiverRole.LEARNER,
                  NotificationReceiverRole.INSTRUCTOR,
                  NotificationReceiverRole.MODERATOR,
                ],
              },
            ]),
          },
        ]),
      },
      {
        name: 'Certificate',
        key: EmailNotificationCategoryKey.CERTIFICATE,
        subCategories: this.emailNotificationSubCategoryRepository.create([
          {
            name: 'Certificate unlocked',
            key: EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Certificate unlocked',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.CERTIFICATE_UNLOCKED
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'Membership',
        key: EmailNotificationCategoryKey.MEMBERSHIP,
        subCategories: this.emailNotificationSubCategoryRepository.create([
          {
            name: 'Buy new package',
            key: EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Membership buy new package',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_BUY_NEW_PACKAGE
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Expiry reminder',
            key: EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Membership expiry reminder',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_EXPIRY_REMINDER
                    ].th.bodyText,
                },
                triggerType: thirtyDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Reset password',
            key: EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Membership reset password',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_RESET_PASSWORD
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Verify email',
            key: EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Membership verify email',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_VERIFY_EMAIL
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
          {
            name: 'Welcome',
            key: EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Membership welcome',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.MEMBERSHIP_WELCOME
                    ].th.bodyText,
                },
                triggerType: immediatelyTriggerType,
              },
            ]),
          },
        ]),
      },
      {
        name: 'Reminder',
        key: EmailNotificationCategoryKey.REMINDER,
        subCategories: this.emailNotificationSubCategoryRepository.create([
          {
            name: 'Activate account',
            key: EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder to activate account',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_ACTIVATE_ACCOUNT
                    ].th.bodyText,
                },
                triggerType: threeDaysAfterTriggerType,
              },
            ]),
          },
          {
            name: 'Booking after inactive',
            key: EmailNotificationSubCategoryKey.REMINDER_BOOKING_AFTER_INACTIVE,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder to booking after inactive',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOKING_AFTER_INACTIVE
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOKING_AFTER_INACTIVE
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOKING_AFTER_INACTIVE
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOKING_AFTER_INACTIVE
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOKING_AFTER_INACTIVE
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOKING_AFTER_INACTIVE
                    ].th.bodyText,
                },
                triggerType: sevenDaysAfterTriggerType,
              },
            ]),
          },
          {
            name: 'Booking session (F2F)',
            key: EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder to booking session (F2F)',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_F2F
                    ].th.bodyText,
                },
                triggerType: twoDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Booking session (Virtual)',
            key: EmailNotificationSubCategoryKey.REMINDER_BOOK_SESSION_VIRTUAL,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder to booking session (Virtual)',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOK_SESSION_VIRTUAL
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOK_SESSION_VIRTUAL
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOK_SESSION_VIRTUAL
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOK_SESSION_VIRTUAL
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOK_SESSION_VIRTUAL
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_BOOK_SESSION_VIRTUAL
                    ].th.bodyText,
                },
                triggerType: twoDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Complete assigned course',
            key: EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_COURSE,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder to complete assigned course',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_COURSE
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_COURSE
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_COURSE
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_COURSE
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_COURSE
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_COURSE
                    ].th.bodyText,
                },
                triggerType: thirtyDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Complete assigned learning track',
            key: EmailNotificationSubCategoryKey.REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder to complete assigned learning track',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_COMPLETE_ASSIGNED_LEARNING_TRACK
                    ].th.bodyText,
                },
                triggerType: thirtyDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Quiz after session',
            key: EmailNotificationSubCategoryKey.REMINDER_QUIZ_AFTER_SESSION,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder that have the quiz after the session',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_QUIZ_AFTER_SESSION
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_QUIZ_AFTER_SESSION
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_QUIZ_AFTER_SESSION
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_QUIZ_AFTER_SESSION
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_QUIZ_AFTER_SESSION
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey
                        .REMINDER_QUIZ_AFTER_SESSION
                    ].th.bodyText,
                },
                triggerType: thirtyDaysBeforeTriggerType,
              },
            ]),
          },
          {
            name: 'Todo assessment',
            key: EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT,
            notifications: this.emailNotificationRepository.create([
              {
                title: 'Reminder to do the assessment',
                emailFormatEn,
                emailFormatTh,
                senderEmailDomain,
                senderEmailUser: 'admin',
                subject: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT
                    ].en.subject,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT
                    ].th.subject,
                },
                bodyHTML: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT
                    ].en.bodyHTML,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT
                    ].th.bodyHTML,
                },
                bodyText: {
                  nameEn:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT
                    ].en.bodyText,
                  nameTh:
                    EmailNotificationSeedData[
                      EmailNotificationSubCategoryKey.REMINDER_TODO_ASSESSMENT
                    ].th.bodyText,
                },
                triggerType: sevenDaysBeforeTriggerType,
              },
            ]),
          },
        ]),
      },
    ];

    await this.emailNotificationCategoryRepository.save(categories);
  }
}
