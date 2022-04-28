import { Connection } from 'typeorm';
import { NestFactory } from '@nestjs/core';

import { SYSTEM_ROLES } from '@seaccentral/core/dist/utils/constants';
import { SeedService } from '@seaccentral/core/dist/seed/seed.service';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { UserSeedService } from '@seaccentral/core/dist/seed/userSeedService';
import { ProfileSeedService } from '@seaccentral/core/dist/seed/profileSeed.service';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { NotificationSeedService } from '@seaccentral/core/dist/seed/notificationSeedService';

import { CouponSeedService } from '@seaccentral/core/dist/seed/couponSeed.service';
import { AppModule } from '../app.module';
import { SearchService } from '../search/search.service';
import { AddressService } from '../address/address.service';
import { createJwPlayerWebhook } from './createJwPlayerWebhook';
import { JwWebhookService } from '../jwplayer/jwWebhook.service';
import { CourseSearchService } from '../course/courseSearch.service';
import { LearningTrackSearchService } from '../learning-track/learningTrackSearch.service';
import { CertificateUnlockRuleService } from '../certificate/certificateUnlockRule.service';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  try {
    const command = process.argv[2];
    const seedService = application.get(SeedService);
    const userService = application.get(UsersService);
    const addressService = application.get(AddressService);
    const userSeedService = application.get(UserSeedService);
    const profileSeedService = application.get(ProfileSeedService);
    const jwWebhookService = application.get(JwWebhookService);
    const searchService = application.get(SearchService);
    const certificateUnlockRuleService = application.get(
      CertificateUnlockRuleService,
    );
    const learningTrackSearchService = application.get(
      LearningTrackSearchService,
    );
    const courseSearchService = application.get(CourseSearchService);
    const couponSeedService = application.get(CouponSeedService);
    const notificationSeedService = application.get(NotificationSeedService);
    const connection = application.get(Connection);
    switch (command) {
      case 'run-seeds':
        // eslint-disable-next-line no-console
        console.log('Running latest seeds...');
        await seedService.createLoginSetting();
        await seedService.createPasswordSetting();
        await userService.populateRoles();
        await seedService.createMockedPlans();
        await addressService.seedAddress();
        await connection.transaction((manager) =>
          profileSeedService.withTransaction(manager).seedCompanyIndustries(),
        );
        await connection.transaction((manager) =>
          profileSeedService.withTransaction(manager).seedOrganizationSizes(),
        );
        await seedService.createCourseCategoriesSubCategories();
        await seedService.createRootLearningWays();
        await seedService.createMainCatalogMenu();
        await notificationSeedService.seedTriggerTypes();
        await notificationSeedService.seedPushNotifications();
        await notificationSeedService.seedEmailNotifications();
        // eslint-disable-next-line no-console
        console.log('Completed running latest seeds...');
        break;
      case 'run-seeds-dev':
        await seedService.createMockTopic();
        await seedService.createMockOrganization();
        await seedService.createMockedProductItemRaw();
        await userSeedService.createRootUser(
          'admin@seasiacenter.com',
          'P@ssw0rd',
          'admin',
          'seac',
        );
        await userSeedService.createUser(
          'instructor1@seasiacenter.com',
          'P@ssw0rd',
          SYSTEM_ROLES.INSTRUCTOR,
          'instructor1',
          'seac',
          [BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE],
        );
        await userSeedService.createUser(
          'moderator1@seasiacenter.com',
          'P@ssw0rd',
          SYSTEM_ROLES.MODERATOR,
          'moderator1',
          'seac',
          [
            BACKEND_ADMIN_CONTROL.ACCESS_CLASS_ATTENDANCE,
            BACKEND_ADMIN_CONTROL.ACCESS_ALL_CLASS_ATTENDANCE,
          ],
        );
        await couponSeedService.seedCouponMaster();
        await couponSeedService.seedCouponDetail();
        await couponSeedService.seedEligibleSkuCode();
        break;
      case 'create-jwplayer-webhook':
        // eslint-disable-next-line no-case-declarations
        const { secret } = await createJwPlayerWebhook(jwWebhookService);
        // eslint-disable-next-line no-console
        console.log(secret);
        break;
      case 'reindex-es-data':
        await searchService.reindexInstructors();
        await courseSearchService.reindex();
        await learningTrackSearchService.reindex();
        await certificateUnlockRuleService.reindexAllUnlockRuleItems();
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('Command not found.');
        process.exit(1);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error running command', error);
    process.exit(1);
  } finally {
    await application.close();
    process.exit(0);
  }
}

bootstrap();
