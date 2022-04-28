import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import {
  CourseSessionBooking,
  CourseSessionBookingStatus,
} from '@seaccentral/core/dist/course/CourseSessionBooking.entity';
import { CoorpacademyService } from '@seaccentral/core/dist/external-package-provider/coorpacademy.service';
import * as S3Coorpacademy from '@seaccentral/core/dist/external-package-provider/utils/s3-coorpacademy';
import { FileImportHistory } from '@seaccentral/core/dist/file-import/FileImportHistory.entity';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { UserAuthProvider } from '@seaccentral/core/dist/user/UserAuthProvider.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import {
  UserUploadHistory,
  UserUploadProcessStatus,
} from '@seaccentral/core/dist/user/UserUploadHistory.entity';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { formatWithTimezone } from '@seaccentral/core/dist/utils/date';
import * as S3 from '@seaccentral/core/dist/utils/s3';
import { Connection, LessThan, Repository } from 'typeorm';
import { CertificateUnlockRuleService } from '../certificate/certificateUnlockRule.service';
import { CourseSearchService } from '../course/courseSearch.service';
import { LearningTrackSearchService } from '../learning-track/learningTrackSearch.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly searchService: SearchService,
    private readonly courseSearchService: CourseSearchService,
    private readonly learningTrackSearchService: LearningTrackSearchService,
    private readonly coorpacademyService: CoorpacademyService,
    private readonly certificateUnlockRuleService: CertificateUnlockRuleService,
    @InjectRepository(PasswordSetting)
    private passwordSettingRepository: Repository<PasswordSetting>,
    @InjectRepository(UserAuthProvider)
    private userAuthProviderRepository: Repository<UserAuthProvider>,
    @InjectRepository(UserUploadHistory)
    private userUploadHistoryRepository: Repository<UserUploadHistory>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(FileImportHistory)
    private fileImportHistoryRepository: Repository<FileImportHistory>,
    @InjectRepository(CourseSessionBooking)
    private courseSessionBookingRepository: Repository<CourseSessionBooking>,
    private readonly connection: Connection,
  ) {}

  @Cron(
    process.env.NODE_ENV === 'development'
      ? CronExpression.EVERY_HOUR
      : CronExpression.EVERY_MINUTE,
    {
      name: 'bulk_create_user',
    },
  )
  async insertUploadedUser() {
    try {
      const uploadedFiles = await this.userUploadHistoryRepository.find({
        where: { isProcessed: false, status: UserUploadProcessStatus.PENDING },
      });
      // eslint-disable-next-line no-restricted-syntax
      for (const file of uploadedFiles) {
        try {
          await this.connection.transaction(async (manager) => {
            if (file.organizationId) {
              const organization = await this.organizationRepository.findOne(
                file.organizationId,
              );
              if (organization)
                await this.userService
                  .withTransaction(manager, {
                    excluded: [NotificationProducer],
                  })
                  .proceedOrganizationUploadedUser(organization, file.s3key);
            } else {
              await this.userService
                .withTransaction(manager, { excluded: [NotificationProducer] })
                .proceedUploadedUser(undefined, file);
            }
          });
        } catch (error) {
          file.status = UserUploadProcessStatus.FAILED;
          await this.userUploadHistoryRepository.save(file);

          throw error;
        }
      }
    } catch (e) {
      this.logger.error('Error processing file', e);
    }
  }

  // @Cron(CronExpression.EVERY_DAY_AT_5AM, {
  //   timeZone: BANGKOK_TIMEZONE,
  // })
  // async passwordExpirationNotificationTask() {
  //   const setting = await this.passwordSettingRepository.findOne();
  //   if (!setting) {
  //     return;
  //   }
  //   let offset = 0;
  //   const limit = 40;
  //   const currentDate = new Date(new Date().toUTCString());
  //   const notifyDate = new Date(new Date().toUTCString());
  //   notifyDate.setDate(notifyDate.getDate() + setting.notifyIn);
  //   const count = await this.getUsersToNotifyCount(notifyDate);
  //   while (offset < count) {
  //     try {
  //       const providers = await this.getUsersToNotify(
  //         notifyDate,
  //         offset,
  //         limit,
  //       );
  //       const destinations = providers
  //         .filter((p) => p.user.email)
  //         .map((p) => {
  //           const expire = p.passwordExpireDate || new Date();
  //           const diffDate = Math.round(
  //             (expire.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
  //           );
  //           return {
  //             email: p.user.email as string,
  //             templateData: JSON.stringify({
  //               firstName: p.user.firstName,
  //               expireDays: diffDate,
  //             }),
  //           };
  //         });
  //       if (destinations.length <= 0) {
  //         return;
  //       }
  //       const templateData = {
  //         firstName: 'Member',
  //         expireDays: setting.notifyIn,
  //       };
  //       await emailService.sendBulkEmailWithTemplate({
  //         destinations,
  //         source: this.configService.get('AWS_SES_SENDER_ADDRESS') as string,
  //         templateName: EMAIL_TEMPLATE.PASSWORD_EXPIRED_NOTIFICATION,
  //         defaultTemplateData: JSON.stringify(templateData),
  //       });
  //       await this.updateNotificationStatus(
  //         providers
  //           .filter((p) => p.user.email)
  //           .map((p) => {
  //             return p.user.id;
  //           }),
  //       );
  //     } catch (e) {
  //       // eslint-disable-next-line no-console
  //       console.log(e);
  //     } finally {
  //       offset += limit;
  //     }
  //   }
  // }

  async updateNotificationStatus(userIds: string[]) {
    return this.userAuthProviderRepository
      .createQueryBuilder()
      .update(UserAuthProvider)
      .set({ passwordExpiryNotificationSentAt: new Date().toUTCString() })
      .where('userId IN (:...userIds)', { userIds })
      .execute();
  }

  async getUsersToNotify(date: Date, offset: number, limit: number) {
    return this.userAuthProviderRepository
      .createQueryBuilder('uap')
      .leftJoinAndSelect('uap.user', 'user')
      .select(['uap', 'user'])
      .where('uap.passwordExpireDate IS NOT NULL')
      .andWhere('uap.passwordExpiryNotificationSentAt IS NULL')
      .andWhere('uap.passwordExpireDate <= :date', { date })
      .andWhere("uap.provider = 'password'")
      .orderBy('uap.updatedAt', 'DESC')
      .offset(offset)
      .limit(limit)
      .getMany();
  }

  async getUsersToNotifyCount(date: Date): Promise<number> {
    return this.userAuthProviderRepository
      .createQueryBuilder('uap')
      .leftJoinAndSelect('uap.user', 'user')
      .select(['uap', 'user'])
      .where('uap.passwordExpireDate IS NOT NULL')
      .andWhere('uap.passwordExpiryNotificationSentAt IS NULL')
      .andWhere('uap.passwordExpireDate <= :date', { date })
      .andWhere("uap.provider = 'password'")
      .orderBy('uap.updatedAt', 'DESC')
      .getCount();
  }

  @Cron(CronExpression.EVERY_DAY_AT_9PM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async updateProgressFromCoorpacademy() {
    if (!this.configService.get('ENABLE_COORPACADEMY_AWS_S3')) return;

    const date = formatWithTimezone(new Date(), BANGKOK_TIMEZONE, 'yyyyMMdd');
    const filename = `export_progressions_seac_${date}`;

    try {
      const data = await S3Coorpacademy.retrieveStreamObject(
        `upload/seac/exports/${filename}.tsv`,
      );

      data.on('error', (e) => {
        this.logger.error(
          `Error retriving file from coorpacademy - ${filename}.tsv`,
          e.message,
        );
      });

      await S3.uploadObjectToS3(
        `progression/coorpacademy/${filename}.tsv`,
        data,
      );
    } catch (e) {
      this.logger.error(
        `Error uploading file to Main s3 - ${filename}.tsv`,
        JSON.stringify(e),
      );
      return;
    }

    let note: string | null = null;

    try {
      await this.coorpacademyService.importCoorpacademyTSV(
        `progression/coorpacademy/${filename}.tsv`,
      );

      await this.coorpacademyService.processCoorpacademyProgress();
    } catch (e) {
      note = JSON.stringify(e);
      this.logger.error(
        `Error processing file from coorpacademy - ${filename}.tsv`,
        note,
      );
    } finally {
      await this.fileImportHistoryRepository.insert({
        key: `progression/coorpacademy/${filename}.tsv`,
        note,
        source: 's3-coorpacademy',
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM, {
    timeZone: BANGKOK_TIMEZONE,
  })
  async markAsAbsent() {
    try {
      const bookings = await this.courseSessionBookingRepository.find({
        relations: ['courseSession'],
        where: {
          status: CourseSessionBookingStatus.NO_MARK,
          courseSession: {
            endDateTime: LessThan(new Date().toISOString()),
          },
        },
      });

      await this.courseSessionBookingRepository.save(
        bookings.map((b) => ({
          ...b,
          status: CourseSessionBookingStatus.NOT_ATTENDED,
        })),
      );
    } catch (err) {
      this.logger.error('Error marking as absent', JSON.stringify(err));
    }
  }

  @Cron(
    process.env.IS_PRODUCTION === 'true'
      ? CronExpression.EVERY_DAY_AT_11PM
      : CronExpression.EVERY_HOUR,
    { timeZone: BANGKOK_TIMEZONE },
  )
  async reIndexESData() {
    await this.courseSearchService.reindex();
    await this.learningTrackSearchService.reindex();
    await this.searchService.reindexInstructors();
    await this.certificateUnlockRuleService.reindexAllUnlockRuleItems();
  }
}
