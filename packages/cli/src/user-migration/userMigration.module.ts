import { Module } from '@nestjs/common';
import { CoreGroupModule } from '@seaccentral/core/dist/group/coreGroup.module';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { InstancyModule } from '../instancy/instancy.module';
import { QueryStreamingModule } from '../query-streaming/queryStreaming.module';
import { AgeRangeMigrationService } from './ageRangeMigration.service';
import { GroupMigrationService } from './groupMigration.service';
import { UserMigrationCommand } from './userMigration.command';
import { UserMigrationService } from './userMigration.service';

@Module({
  imports: [InstancyModule, QueryStreamingModule, UsersModule, CoreGroupModule],
  providers: [
    UserMigrationCommand,
    UserMigrationService,
    AgeRangeMigrationService,
    GroupMigrationService,
  ],
})
export class UserMigrationModule {}
