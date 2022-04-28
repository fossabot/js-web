import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CompanySizeRangeService } from './companySizeRange.service';
import { IndustryService } from './industry.service';
import { ProfessionController } from './profession.controller';

@Module({
  imports: [
    UsersModule,
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
  controllers: [ProfessionController],
  providers: [CompanySizeRangeService, IndustryService],
})
export class ProfessionModule {}
