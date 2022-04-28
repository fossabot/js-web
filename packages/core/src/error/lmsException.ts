import { HttpException } from '@nestjs/common';

export default class LMSException extends HttpException {
  code = 'ERROR_LMS';
}
