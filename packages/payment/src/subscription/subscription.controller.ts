import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Subscription } from '@seaccentral/core/dist/payment/Subscription.entity';

import { SubscriptionService } from './subscription.service';
import IRequestWithUser from '../index/interface/IRequestWithUser.interface';

@Controller('v1/subscription')
@ApiTags('Subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getAll() {
    // TODO: Only allowed for admins
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getForCurrentUser(@Req() req: IRequestWithUser) {
    const { user } = req;
    const response = new BaseResponseDto<Subscription[]>();

    const subscriptions = await this.subscriptionService.getAllForUser(user);
    response.data = subscriptions;

    return response;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById() {
    // TODO: Only allowed for admins for users with permission
  }
}
