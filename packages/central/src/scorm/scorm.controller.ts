import {
  Req,
  Res,
  Query,
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Logger,
  Param,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWSError } from 'aws-sdk';
import { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';

import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import ScormAuthGuard from '../guards/scormAuth.guard';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { ScormService } from './scorm.service';
import { PrepareUploadBody } from './dto/PrepareUploadBody';
import { PrepareUploadResponse } from './dto/PrepareUploadResponse';
import { S3_SCORM_FOLDER } from '../utils/constants';
import { CourseSubscriptionPlanActivator } from '../course/CourseSubscriptionPlan.activator';

@Controller('v1/scorm')
@ApiTags('Scorm')
export class ScormController {
  private readonly logger = new Logger(ScormController.name);

  constructor(
    private readonly scormService: ScormService,
    private readonly configService: ConfigService,
  ) {}

  // TODO add ACL logic to allowed only who have right to access the file.
  @UseGuards(ScormAuthGuard)
  @Get('file')
  async getFile(
    @Query() query: { key: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const file = await this.scormService.getS3SteamObject(query.key);

    file
      .on('error', (e: AWSError) => {
        this.logger.error(e, 'Get Scorm content error');

        if (e.statusCode)
          res.status(e.statusCode).send({ message: e.message, code: e.code });
        else res.status(502).send();
      })
      .pipe(res);
  }

  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseGuards(JwtAuthGuard)
  @Post('presigned-url')
  async prepareUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse[]>> {
    const response = new BaseResponseDto<PrepareUploadResponse[]>();
    const data = await this.scormService.getS3PresignedUrl(
      prepareUploadBody,
      S3_SCORM_FOLDER,
    );
    response.data = data;
    return response;
  }

  @UseGuards(JwtAuthGuard, CourseSubscriptionPlanActivator)
  @Get('verify-access/:outlineId')
  async verifyAccess(
    @Param('outlineId') outlineId: string,
    @Req() req: IRequestWithUser,
  ) {
    const data = await this.scormService.verifyAccess(outlineId, req.user);
    const response = new BaseResponseDto();

    response.data = data;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('access-token')
  async getScormToken(@Res() res: Response, @Req() req: IRequestWithUser) {
    const scormToken = await this.scormService.generateTemporaryAccessToken(
      req.user,
    );

    res.cookie('temp_token', scormToken, {
      maxAge:
        this.configService.get('SCORM_JWT_EXPIRATION_TIME_IN_SECONDS') * 1000,
    });

    res.send({
      scormToken,
      scormTokenExpiry: this.configService.get(
        'SCORM_JWT_EXPIRATION_TIME_IN_SECONDS',
      ),
    });
  }
}
