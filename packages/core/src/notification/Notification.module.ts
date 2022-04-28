import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../user/users.module';
import { EmailNotification } from './EmailNotification.entity';
import { NotificationService } from './Notification.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([EmailNotification])],
  providers: [NotificationService],
  exports: [NotificationService, TypeOrmModule],
})
export class NotificationModule {}
