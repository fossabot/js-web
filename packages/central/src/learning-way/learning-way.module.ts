import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LearningWay } from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { LearningWayService } from './learning-way.service';
import { LearningWayController } from './learning-way.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningWay, CourseOutline]),
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
  controllers: [LearningWayController],
  providers: [LearningWayService],
})
export class LearningWayModule {}
