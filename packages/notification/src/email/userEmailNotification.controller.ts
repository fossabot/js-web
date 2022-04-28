import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { GetUserEmailNotificationResponseDto } from './dto/GetUserEmailNotificationResponseDto';
import { GetUserEmailNotificationsQueryDto } from './dto/GetUserEmailNotificationsQueryDto';
import { UserEmailNotificationService } from './userEmailNotification.service';

@ApiSecurity('auth_token')
@Controller('v1/user-email-notifications')
@ApiTags('User Email Notifications')
export class UserEmailNotificationController {
  constructor(
    private readonly userEmailNotificationService: UserEmailNotificationService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      UserEmailNotificationController.prototype.getUserEmailNotificationsList,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getUserEmailNotificationsList(
    @Query() query: GetUserEmailNotificationsQueryDto,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { data, count } = await this.userEmailNotificationService.list({
      ...query,
      skip,
      take,
    });

    const response = new BaseResponseDto<
      GetUserEmailNotificationResponseDto[]
    >();
    response.data = data.map((d) => new GetUserEmailNotificationResponseDto(d));
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      UserEmailNotificationController.prototype
        .getUserEmailNotificationsListCount,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('count')
  async getUserEmailNotificationsListCount(
    @Query() query: GetUserEmailNotificationsQueryDto,
  ) {
    const counts = await this.userEmailNotificationService.countByRange(query);
    const response = new BaseResponseDto<number[]>();
    response.data = counts;
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      UserEmailNotificationController.prototype.getUserEmailNotification,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getUserEmailNotification(@Param('id') id: string) {
    const notification = await this.userEmailNotificationService.getItem(id);

    const response = new BaseResponseDto<GetUserEmailNotificationResponseDto>();
    response.data = new GetUserEmailNotificationResponseDto(notification);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      UserEmailNotificationController.prototype.resendUserEmailNotification,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_EMAIL_NOTIFICATIONS)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':id/resend')
  async resendUserEmailNotification(@Param('id') id: string) {
    await this.userEmailNotificationService.resend(id);

    const response = new BaseResponseDto();
    return response;
  }
}
