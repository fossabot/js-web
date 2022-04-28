import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Incoming request ${req.method} ${req.baseUrl}`);
    this.logger.log(`Request headers ${JSON.stringify(req.headers)}`);
    this.logger.log(`Request body ${JSON.stringify(req.body)}`);
    this.logger.log(`Request params ${JSON.stringify(req.param)}`);
    this.logger.log(`Request query ${JSON.stringify(req.query)}`);
    next();
  }
}
