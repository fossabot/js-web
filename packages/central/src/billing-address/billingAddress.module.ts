import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CorePaymentModule } from '@seaccentral/core/dist/payment/corePayment.module';
import { BillingAddressController } from './billingAddress.controller';
import { BillingAddressService } from './billingAddress.service';

@Module({
  imports: [
    CorePaymentModule,
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
  controllers: [BillingAddressController],
  providers: [BillingAddressService],
})
export class BillingAddressModule {}
