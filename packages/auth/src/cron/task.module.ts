import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UserSession } from '@seaccentral/core/dist/user/UserSession.entity';
import { PasswordSetting } from '@seaccentral/core/dist/admin/Password.setting.entity';
import { TaskService } from './task.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, PasswordSetting])],
  providers: [TaskService],
})
export class TaskModule {}
