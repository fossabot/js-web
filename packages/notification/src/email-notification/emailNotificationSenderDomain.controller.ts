import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { EmailNotificationService } from './emailNotification.service';

@Controller('v1/email-notification-sender-domain')
@ApiTags('EmailNotification')
@ApiSecurity('auth_token')
export class EmailNotificationSenderDomainController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @Get('')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      EmailNotificationSenderDomainController.prototype
        .getEmailNotificationDomains,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  async getEmailNotificationDomains() {
    const data =
      await this.emailNotificationService.getEmailNotificationDomains();
    const response = new BaseResponseDto();
    response.data = data;
    return response;
  }
}
