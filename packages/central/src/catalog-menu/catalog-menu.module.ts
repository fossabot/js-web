import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatalogMenu } from '@seaccentral/core/dist/catalog-menu/CatalogMenu.entity';
import { CatalogMenuTopic } from '@seaccentral/core/dist/catalog-menu/CatalogMenuTopic.entity';
import { CatalogMenuLearningWay } from '@seaccentral/core/dist/catalog-menu/CatalogMenuLearningWay.entity';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { Topic } from '@seaccentral/core/dist/topic/Topic.entity';
import { LearningWay } from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { CatalogMenuService } from './catalog-menu.service';
import { CatalogMenuController } from './catalog-menu.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CatalogMenu,
      CatalogMenuTopic,
      CatalogMenuLearningWay,
      Language,
      Topic,
      LearningWay,
    ]),
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
  controllers: [CatalogMenuController],
  providers: [CatalogMenuService],
})
export class CatalogMenuModule {}
