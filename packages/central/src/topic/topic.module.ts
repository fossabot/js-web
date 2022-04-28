import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Topic } from '@seaccentral/core/dist/topic/Topic.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CourseTopic } from '@seaccentral/core/dist/course/CourseTopic.entity';

import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic, CourseTopic]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')}s`,
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
