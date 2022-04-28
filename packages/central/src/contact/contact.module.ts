import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CRMModule } from '@seaccentral/core/dist/crm/crm.module';
import { ContactRetailController } from './contact.retail.controller';
import { ContactCorporateController } from './contact.corporate.controller';
import { ContactTrialController } from './contact.trial.controller';

@Module({
  imports: [
    HttpModule,
    CRMModule,
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
    ConfigModule,
  ],
  controllers: [
    ContactRetailController,
    ContactCorporateController,
    ContactTrialController,
  ],
})
export class ContactModule {}
