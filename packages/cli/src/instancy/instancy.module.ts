import { Module } from '@nestjs/common';
import { InstancyService } from './instancy.service';
import { instancyDbConnectionFactory } from './instancyDbConnection';

@Module({
  providers: [instancyDbConnectionFactory, InstancyService],
  exports: [instancyDbConnectionFactory, InstancyService],
})
export class InstancyModule {}
