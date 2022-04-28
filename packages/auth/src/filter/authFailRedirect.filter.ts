import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { classToPlain, serialize } from 'class-transformer';
import { encode } from 'querystring';
import { isURL } from 'class-validator';
import urljoin from 'url-join';
import LMSException from '@seaccentral/core/dist/error/lmsException';
import { BaseResponseDto } from '../dto/base.response.dto';

@Injectable()
@Catch(LMSException)
export class AuthFailRedirectFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new Logger(AuthFailRedirectFilter.name);

  catch(exception: LMSException, host: ArgumentsHost) {
    this.logger.error(exception.message);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { referer } = request.headers;
    const defaultUrl = this.configService.get('CLIENT_BASE_URL');

    const exceptionData = exception.getResponse();

    const dto = new BaseResponseDto<string>();
    dto.code = exception.code;
    dto.message = exception.message;
    dto.data =
      typeof exceptionData === 'object' ? serialize(exceptionData) : undefined;
    const plainDto = classToPlain(dto);
    const querystringPayload = encode(plainDto);

    if (referer && isURL(referer)) {
      const redirectUrl = new URL(referer);
      redirectUrl.search = querystringPayload;
      response.redirect(redirectUrl.toString());

      return redirectUrl.toString();
    }

    const redirectUrl = urljoin(defaultUrl, 'login', `?${querystringPayload}`);
    response.redirect(redirectUrl);

    return redirectUrl;
  }
}
