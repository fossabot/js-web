import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
  Type,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import axios from 'axios';
import qs from 'qs';

// https://developers.google.com/recaptcha/docs/v3#site_verify_response
interface ReCaptchaVerifyTokenResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

export function reCaptchaGuard(action?: string): Type<CanActivate> {
  class MixinReCaptchaGuard implements CanActivate {
    @Inject(ConfigService)
    protected configService: ConfigService;

    async canActivate(context: ExecutionContext) {
      const secret = this.configService.get('RECAPTCHA_SECRET_KEY');
      const minScore = +this.configService.get('RECAPTCHA_MIN_SCORE');
      if (!secret) {
        return true;
      }
      const { recaptcha } = context.switchToHttp().getRequest<Request>().body;
      const payload = {
        secret,
        response: recaptcha,
      };
      const { data } = await axios.post<ReCaptchaVerifyTokenResponse>(
        'https://www.google.com/recaptcha/api/siteverify',
        qs.stringify(payload),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const { success, score, action: captchaAction } = data;
      const matchAction = action ? captchaAction === action : true;

      return success && score >= minScore && matchAction;
    }
  }

  const guard = mixin(MixinReCaptchaGuard);
  return guard;
}
