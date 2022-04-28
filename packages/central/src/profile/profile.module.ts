import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CRMModule } from '@seaccentral/core/dist/crm/crm.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    UsersModule,
    CRMModule,
    UploadModule,
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
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
