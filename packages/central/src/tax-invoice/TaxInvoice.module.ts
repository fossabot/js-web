import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@seaccentral/core/dist/user/users.module';
import { CorePaymentModule } from '@seaccentral/core/dist/payment/corePayment.module';
import { AccountTaxInvoiceService } from './AccountTaxInvoice.service';
import { TaxInvoiceController } from './TaxInvoice.controller';

@Module({
  imports: [
    UsersModule,
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
  controllers: [TaxInvoiceController],
  providers: [AccountTaxInvoiceService],
})
export class TaxInvoiceModule {}
