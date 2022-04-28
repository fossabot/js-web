import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { getPaginationResponseParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import IRequestWithUser from './interface/IRequestWithUser';
import { UserService } from './userNotification.service';

@ApiTags('me')
@Controller('v1/me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getUserNotification(
    @Req() req: IRequestWithUser,
    @Query() query: BaseQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const result = await this.userService.getUserNotification(
      req.user,
      query,
      acceptLanguage,
    );
    const pagination = getPaginationResponseParams(query, result.count);
    return { data: result.data, pagination };
  }

  @Get('/unread-count')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getUserUnreadNotificationCount(@Req() req: IRequestWithUser) {
    const result = await this.userService.getUserUnreadNotificationCount(
      req.user,
    );
    return result;
  }

  @Patch('/mark-all-read')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async markAllNotificationAsRead(@Req() req: IRequestWithUser) {
    const result = await this.userService.markAllNotificationsAsRead(req.user);
    return result;
  }

  @Patch('/mark-read/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async markNotificationAsRead(
    @Req() req: IRequestWithUser,
    @Param('id') id: string,
  ) {
    const result = await this.userService.markNotificationAsRead(req.user, id);
    return result;
  }
}
