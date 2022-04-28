/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';

import { PushService } from './push/push.service';

// Purely for testing, will remove after finish
class NotifyBody {
  @ApiProperty({ example: 'admin@seasiacenter.com' })
  @IsString()
  userEmail: string;

  @IsObject()
  @ApiProperty({ example: {} })
  @IsOptional()
  variables: Record<string, any>;
}

class NotifyQuery {
  @ApiPropertyOptional({ default: LanguageCode.EN, enum: LanguageCode })
  @IsIn(Object.values(LanguageCode))
  @IsOptional()
  langCode: LanguageCode;

  @ApiPropertyOptional({
    default: PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_ENROLLMENT,
    enum: PushNotificationSubCategoryKey,
  })
  @IsOptional()
  @IsIn(Object.values(PushNotificationSubCategoryKey))
  subCategoryKey: PushNotificationSubCategoryKey;
}
@ApiTags('notification')
@Controller('v1')
export class AppController {
  constructor(
    private readonly pushService: PushService,
    private readonly userService: UsersService,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  // TODO: Just for testing. Please delete once we have use case for web socket.
  @Post()
  @ApiBody({ type: Object })
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  testEmit(@Body() body: any) {
    this.pushService.publish(body || new Date().toISOString(), body.id);
  }

  @Post('notify')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async testNotify(@Body() body: NotifyBody, @Query() query: NotifyQuery) {
    await this.notificationProducer.notify(
      query.subCategoryKey,
      (
        await this.userService.getByUsernameOrEmail(body.userEmail)
      ).id,
      body.variables,
    );
  }

  @Get('healthcheck')
  @HttpCode(200)
  healthCheck() {
    return 'healthy';
  }
}
