import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAnnouncement } from '@seaccentral/core/dist/notification/SystemAnnouncement.entity';
import { CronService } from './cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemAnnouncement])],
  providers: [CronService],
})
export class CronModule {}
