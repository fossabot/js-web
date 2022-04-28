import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from '@seaccentral/core/dist/notification/UserNotification.entity';
import { UserService } from './userNotification.service';
import { UserController } from './userNotification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
