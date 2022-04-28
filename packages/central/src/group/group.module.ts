import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { RedisCacheModule } from '@seaccentral/core/dist/redis/redisCache.module';

import { GroupService } from './group.service';
import { GroupController } from './group.controller';

@Module({
  imports: [
    UsersModule,
    RedisCacheModule,
    TypeOrmModule.forFeature([User, Group, GroupUser]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
