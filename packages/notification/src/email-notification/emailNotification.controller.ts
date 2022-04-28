import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  Headers,
  Param,
  Patch,
  Body,
  Put,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { Connection } from 'typeorm';
import { GetAllEmailNotificationResponseDto } from './dto/getAllEmailNotificationResponse.dto';
import { UpdateEmailNotificationDto } from './dto/updateEmailNotification.dto';
import { UpdateEmailNotificationStatusDto } from './dto/updateEmailNotificationStatus.dto';
import { EmailNotificationService } from './emailNotification.service';

@Controller('v1/email-notification')
@ApiTags('EmailNotification')
@ApiSecurity('auth_token')
export class EmailNotificationController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly connection: Connection,
  ) {}

  @Get('')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailNotificationController.prototype.getAll),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAll(
    @Query() dto: BaseQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const { data, total } = await this.emailNotificationService.getAll(dto);
    const response = new BaseResponseDto<
      GetAllEmailNotificationResponseDto[]
    >();
    response.data = data.map(
      (d) => new GetAllEmailNotificationResponseDto(d, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(dto, total);
    return response;
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailNotificationController.prototype.getEmailNotificationById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  @UseInterceptors(ClassSerializerInterceptor)
  async getEmailNotificationById(@Param('id') id: string) {
    const response = new BaseResponseDto<EmailNotification>();
    response.data =
      await this.emailNotificationService.getEmailNotificationById(id);
    return response;
  }

  @Patch(':id/status')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      EmailNotificationController.prototype.updateEmailNotificationStatus,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async updateEmailNotificationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEmailNotificationStatusDto,
  ) {
    const { isActive } = dto;
    await this.emailNotificationService.updateEmailNotificationStatus(
      id,
      isActive,
    );
  }

  @Put(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(EmailNotificationController.prototype.updateEmailNotification),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async updateEmailNotification(
    @Param('id') id: string,
    @Body() dto: UpdateEmailNotificationDto,
  ) {
    await this.connection.transaction((manager) => {
      return this.emailNotificationService
        .withTransaction(manager)
        .updateEmailNotification(id, dto);
    });
  }
}
