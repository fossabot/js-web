import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import addLog from './addLog';
import IRequestWithUser from '../user/IRequestWithUser';

export interface IUserLogConfig {
  category: string;
  subCategory?: string;
}

@Injectable()
export class UserLogInterceptor implements NestInterceptor {
  private logger = new Logger(UserLogInterceptor.name);

  constructor(private logConfig: IUserLogConfig) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();

    const logStartAt = new Date().toISOString();
    const logBody = {
      logStartAt,
      message: '',
      endpoint: request.url,
      method: request.method,
      userId: request.user.id,
      email: request.user.email,
      requestBody: request.body,
      category: this.logConfig.category,
      userFullName: request.user.fullName,
      subCategory: this.logConfig.subCategory,
    };
    addLog({ ...logBody, status: 'PENDING' })?.catch((e) => {
      this.logger.error('Error adding request log to dynamodb', e);
    });

    return next.handle().pipe(
      tap(() => {
        addLog({ ...logBody, status: 'SUCCESS' })?.catch((e) => {
          this.logger.error('Error adding response logging to dynamodb', e);
        });
      }),
    );
  }
}
