import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { PushNotification } from '@seaccentral/core/dist/notification/PushNotification.entity';
import { UpdatePushNotificationStatusDto } from './dto/UpdatePushNotificationStatus.dto';
import { NotifyService } from './notify.service';

@Controller('v1/push-notifications')
@ApiTags('PushNotification')
@ApiSecurity('auth_token')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class PushNotificationController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get('')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_PUSH_NOTIFICATION_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(PushNotificationController.prototype.getPushNotifications),
  )
  async getPushNotifications(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);

    const { notifications, count } = await this.notifyService.findAll({
      ...query,
      skip,
      take,
    });

    const response = new BaseResponseDto<PushNotification[]>();

    response.data = notifications;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Patch(':id/status')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_PUSH_NOTIFICATION_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(PushNotificationController.prototype.patchPushNotification),
  )
  patchPushNotification(
    @Param('id') id: string,
    @Body() dto: UpdatePushNotificationStatusDto,
  ) {
    return this.notifyService.updatePushNotificationStatus(id, dto.isActive);
  }
}
