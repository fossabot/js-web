import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './Group.entity';
import { GroupUser } from './GroupUser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupUser])],
  exports: [TypeOrmModule],
})
export class CoreGroupModule {}
