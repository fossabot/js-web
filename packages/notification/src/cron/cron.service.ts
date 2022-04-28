import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemAnnouncement } from '@seaccentral/core/dist/notification/SystemAnnouncement.entity';
import { BANGKOK_TIMEZONE } from '@seaccentral/core/dist/utils/constants';
import { LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(SystemAnnouncement)
    private readonly systemAnnouncement: Repository<SystemAnnouncement>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: BANGKOK_TIMEZONE })
  async inactiveSystemAnnouncement() {
    await this.systemAnnouncement.update(
      {
        endDate: LessThanOrEqual(new Date()),
        isActive: true,
      },
      { isActive: false },
    );
  }
}
