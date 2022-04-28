import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AssessmentCenterGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const token = this.configService.get('ASSESSMENT_CENTER_TOKEN');
    const req = context.switchToHttp().getRequest<Request>();
    return token === req.headers['x-assessment-center-token'];
  }
}
