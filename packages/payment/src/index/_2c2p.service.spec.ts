import { mock } from 'jest-mock-extended';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpService } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PAYMENT_STATUS_RESPONSE_CODE } from '@seaccentral/core/dist/crm/payment';
import { _2C2PService } from './_2c2p.service';

function getMocks() {
  const configService = mock<ConfigService>();
  configService.get.mockImplementation((key) => {
    return process.env[key];
  });
  const httpService = mock<HttpService>();
  httpService.post.mockImplementation(() => {
    return {
      toPromise: () => {
        return {
          data: {
            payload: 'payload',
          },
        };
      },
    } as any;
  });
  const jwtService = mock<JwtService>();
  jwtService.sign.mockImplementation(() => 'signed-jwt');
  jwtService.verifyAsync.mockImplementation(async () => {
    return {
      respCode: PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_SUCCESSFUL,
    };
  });

  return { configService, httpService, jwtService };
}

describe('2C2P service', () => {
  beforeAll(() => {
    process.env.PAYMENT_2C2P_MERCHANT_ID = 'PAYMENT_2C2P_MERCHANT_ID';
    process.env.PAYMENT_2C2P_SECRET_KEY = 'PAYMENT_2C2P_SECRET_KEY';
    process.env.PAYMENT_2C2P_QR_MERCHANT_ID = 'PAYMENT_2C2P_QR_MERCHANT_ID';
    process.env.PAYMENT_2C2P_QR_SECRET_KEY = 'PAYMENT_2C2P_QR_SECRET_KEY';
    process.env.PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID =
      'PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID';
    process.env.PAYMENT_2C2P_INSTALLMENT_SECRET_KEY =
      'PAYMENT_2C2P_INSTALLMENT_SECRET_KEY';
    process.env.PAYMENT_2C2P_API_BASE_URL = 'www.oozou-2c2p.mock';
  });

  describe('getSecretByMerchant', () => {
    it('should return correct secret based on merchant id', () => {
      const { configService, httpService, jwtService } = getMocks();
      const target = new _2C2PService(configService, httpService, jwtService);

      let actual = target.getSecretByMerchant('PAYMENT_2C2P_MERCHANT_ID');
      expect(actual).toEqual(process.env.PAYMENT_2C2P_SECRET_KEY);

      actual = target.getSecretByMerchant('PAYMENT_2C2P_QR_MERCHANT_ID');
      expect(actual).toEqual(process.env.PAYMENT_2C2P_QR_SECRET_KEY);

      actual = target.getSecretByMerchant(
        'PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID',
      );
      expect(actual).toEqual(process.env.PAYMENT_2C2P_INSTALLMENT_SECRET_KEY);

      actual = target.getSecretByMerchant('random');
      expect(actual).toEqual(process.env.PAYMENT_2C2P_SECRET_KEY);
    });
  });

  describe('getPaymentToken', () => {
    it('should call 2C2P endpoint based on configured env', async () => {
      const { configService, httpService, jwtService } = getMocks();
      const target = new _2C2PService(configService, httpService, jwtService);

      const actual = await target.getPaymentToken({
        merchantID: 'PAYMENT_2C2P_MERCHANT_ID',
      } as any);

      expect(actual.respCode).toEqual('0000');
      expect(httpService.post).toHaveBeenCalledWith(
        `${process.env.PAYMENT_2C2P_API_BASE_URL}/paymentToken`,
        { payload: 'signed-jwt' },
      );
    });

    it('should throw exception when 2C2P doesnt give success code in response', async () => {
      const { configService, httpService, jwtService } = getMocks();
      const target = new _2C2PService(configService, httpService, jwtService);
      jwtService.verifyAsync.mockImplementation(async () => ({
        respCode: PAYMENT_STATUS_RESPONSE_CODE.PAYMENT_FAILED,
      }));

      const error = await target
        .getPaymentToken({
          merchantID: 'PAYMENT_2C2P_MERCHANT_ID',
        } as any)
        .catch((err) => err);

      expect(error).toBeInstanceOf(HttpException);
    });
  });
});
