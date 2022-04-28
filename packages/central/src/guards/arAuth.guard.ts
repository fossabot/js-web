import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ARAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.configService.get('X_AR_TOKEN');
    const matchHeader = token === req.headers['x-ar-token'];
    const matchQuery = token === req.query.arToken;

    return matchHeader || matchQuery;
  }
}
