import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tag } from '@seaccentral/core/dist/tag/Tag.entity';
import { CourseTag } from '@seaccentral/core/dist/course/CourseTag.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, CourseTag]),
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
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
