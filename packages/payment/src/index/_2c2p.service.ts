import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import {
  PAYMENT_OPTIONS,
  PAYMENT_STATUS_RESPONSE_CODE,
} from '@seaccentral/core/dist/crm/payment';
import { PaymentGatewayCallbackV4 } from '@seaccentral/core/dist/payment/PaymentGatewayCallbackV4';
import { GetPaymentTokenRequestDto } from './dto/GetPaymentTokenRequest.dto';
import { GetPaymentTokenResponseDto } from './dto/GetPaymentTokenResponse.dto';

@Injectable()
export class _2C2PService {
  private readonly logger = new Logger(_2C2PService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  async getPaymentToken(
    requestDto: GetPaymentTokenRequestDto,
  ): Promise<GetPaymentTokenResponseDto> {
    const paymentApiUrl = `${this.configService.get(
      'PAYMENT_2C2P_API_BASE_URL',
    )}/paymentToken`;

    const secret = this.getSecretByMerchant(requestDto.merchantID);

    const payload = this.jwtService.sign(requestDto, {
      secret,
    });

    const paymentTokenData = await this.httpService
      .post<{ payload: string }>(paymentApiUrl, { payload })
      .toPromise();

    const result =
      await this.jwtService.verifyAsync<GetPaymentTokenResponseDto>(
        paymentTokenData.data.payload,
        { secret },
      );

    if (result.respCode !== PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_SUCCESSFUL) {
      throw new HttpException(result.respDesc, HttpStatus.BAD_REQUEST);
    }

    return result;
  }

  getSecretByMerchant(merchantId: string): string {
    switch (merchantId) {
      case this.configService.get('PAYMENT_2C2P_MERCHANT_ID'):
        return this.configService.get('PAYMENT_2C2P_SECRET_KEY') as string;

      case this.configService.get('PAYMENT_2C2P_QR_MERCHANT_ID'):
        return this.configService.get('PAYMENT_2C2P_QR_SECRET_KEY') as string;

      case this.configService.get('PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID'):
        return this.configService.get(
          'PAYMENT_2C2P_INSTALLMENT_SECRET_KEY',
        ) as string;

      default:
        return this.configService.get('PAYMENT_2C2P_SECRET_KEY') as string;
    }
  }

  getMerchantIdAndSecretByPaymentOption(paymentOption: PAYMENT_OPTIONS) {
    switch (paymentOption) {
      case PAYMENT_OPTIONS.CREDIT_CARD: {
        const merchantId = this.configService.get('PAYMENT_2C2P_MERCHANT_ID');
        const secretKey = this.getSecretByMerchant(merchantId);
        return { merchantId, secretKey };
      }

      case PAYMENT_OPTIONS.INSTALLMENT_PAYMENT: {
        const merchantId = this.configService.get(
          'PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID',
        );
        const secretKey = this.getSecretByMerchant(merchantId);
        return { merchantId, secretKey };
      }

      case PAYMENT_OPTIONS.QR_CODE: {
        const merchantId = this.configService.get(
          'PAYMENT_2C2P_QR_MERCHANT_ID',
        );
        const secretKey = this.getSecretByMerchant(merchantId);
        return { merchantId, secretKey };
      }

      default: {
        const merchantId = this.configService.get('PAYMENT_2C2P_MERCHANT_ID');
        const secretKey = this.getSecretByMerchant(merchantId);
        return { merchantId, secretKey };
      }
    }
  }

  async paymentInquiry(
    paymentToken: string,
    invoiceNo: string,
    paymentOption: PAYMENT_OPTIONS,
  ): Promise<PaymentGatewayCallbackV4 | undefined> {
    const { merchantId, secretKey } =
      this.getMerchantIdAndSecretByPaymentOption(paymentOption);

    const request = {
      paymentToken,
      merchantID: merchantId,
      invoiceNo,
      locale: 'en',
    };

    const payload = await this.jwtService.signAsync(request, {
      secret: secretKey,
    });
    const paymentApiUrl = `${this.configService.get(
      'PAYMENT_2C2P_API_BASE_URL',
    )}/paymentInquiry`;
    const response = await this.httpService
      .post<{ payload: string }>(paymentApiUrl, { payload })
      .toPromise();

    const result = this.jwtService.verifyAsync<PaymentGatewayCallbackV4>(
      response.data.payload,
      { secret: secretKey },
    );

    return result;
  }
}
