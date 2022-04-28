import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { Connection, EntityManager } from 'typeorm';
import { InstancyService } from '../instancy/instancy.service';
import { UserMigrationService } from './userMigration.service';
import { QueryStreamingService } from '../query-streaming/queryStreaming.service';
import { AgeRangeMigrationService } from './ageRangeMigration.service';
import { GroupMigrationService } from './groupMigration.service';

@Injectable()
@Command({
  name: 'migrate-user',
  description: 'migrate user from instancy to our database',
})
export class UserMigrationCommand implements CommandRunner {
  constructor(
    private readonly instancyService: InstancyService,
    private readonly queryStreamingService: QueryStreamingService,
    private readonly userMigrateService: UserMigrationService,
    private readonly ageRangeMigrationService: AgeRangeMigrationService,
    private readonly groupMigrationService: GroupMigrationService,
    private readonly connection: Connection,
  ) {}

  async run() {
    return this.connection.transaction(async (manager) => {
      await this.migrateAgeRange(manager);
      await this.migrateGroup(manager);
      await this.migrateUser(manager);
    });
  }

  async migrateAgeRange(entityManager: EntityManager) {
    const request = this.instancyService.getAllAgeRanges();
    await this.queryStreamingService.initStream(
      request,
      this.ageRangeMigrationService.withTransaction(entityManager),
    );
  }

  async migrateGroup(entityManager: EntityManager) {
    const request = this.instancyService.getAllOrgNames();
    await this.queryStreamingService.initStream(
      request,
      this.groupMigrationService.withTransaction(entityManager),
    );
  }

  async migrateUser(entityManager: EntityManager) {
    const request = this.instancyService.getAllUsers();
    await this.queryStreamingService.initStream(
      request,
      this.userMigrateService.withTransaction(entityManager),
    );
  }
}
