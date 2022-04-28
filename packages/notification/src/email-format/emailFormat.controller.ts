import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import mime from 'mime';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { EmailFormat } from '@seaccentral/core/dist/notification/EmailFormat.entity';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { Connection, DeleteResult } from 'typeorm';
import * as s3UrlConditionBuilder from '@seaccentral/core/dist/utils/s3UrlConditionBuilder';
import { UploadService } from '../upload/upload.service';
import { S3_EMAIL_FORMAT_FOLDER } from '../utils/constants';
import { EmailFormatRequestDto } from './dto/emailFormat.dto';
import { EmailFormatService } from './emailFormat.service';

@Controller('v1/email-format')
@ApiTags('EmailFormat')
@ApiSecurity('auth_token')
export class EmailFormatController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly emailFormatService: EmailFormatService,
    private readonly connection: Connection,
  ) {}

  @Post('images')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailFormatController.prototype.uploadImages),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async uploadImages() {
    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: 'email-format',
      folder: S3_EMAIL_FORMAT_FOLDER,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_EMAIL_FORMAT_FOLDER),
        s3UrlConditionBuilder.maxSizeMB(5),
        s3UrlConditionBuilder.contentType(mime.getType('png') as string),
      ),
    });
    const response = new BaseResponseDto<AWS.S3.PresignedPost>();
    response.data = s3PresignedUrl;

    return response;
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailFormatController.prototype.saveEmailFormat),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async saveEmailFormat(@Body() dto: EmailFormatRequestDto) {
    const emailFormat = await this.emailFormatService.saveEmailFormat(dto);
    const response = new BaseResponseDto<EmailFormat>();
    response.data = emailFormat;

    return response;
  }

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailFormatController.prototype.getAllEmailFormats),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async getAllEmailFormats(@Query() query: BaseQueryDto) {
    const results = await this.emailFormatService.findEmailFormat(query);
    const response = new BaseResponseDto<EmailFormat[]>();
    response.data = results;

    return response;
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailFormatController.prototype.getEmailFormatById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async getEmailFormatById(@Param('id') id: string) {
    const result = await this.emailFormatService.findEmailFormatById(id);
    const response = new BaseResponseDto<EmailFormat>();
    response.data = result;

    return response;
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailFormatController.prototype.removeEmailFormat),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async removeEmailFormat(@Param('id') id: string) {
    const result = await this.connection.transaction(async (manager) => {
      return this.emailFormatService
        .withTransaction(manager)
        .removeEmailFormat(id);
    });
    const response = new BaseResponseDto<DeleteResult>();
    response.data = result;

    return response;
  }
}
