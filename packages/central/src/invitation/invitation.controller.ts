import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { userLogCategory } from '@seaccentral/core/dist/user-log/constants';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { UserLogInterceptor } from '@seaccentral/core/dist/user-log/userLogInterceptor.interceptor';

import { InvitationService } from './invitation.service';
import { InviteUserBody } from './dto/InviteUserBody.dto';
import IRequestWithUser from './interface/IRequestWithUser';

@Controller('v1/invitation')
@ApiTags('Invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  invite(
    @Body() inviteUserBody: InviteUserBody,
    @Req() request: IRequestWithUser,
  ) {
    const invitedBy = request.user;
    const token = this.invitationService.create(inviteUserBody, invitedBy);

    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/resend')
  @HttpCode(204)
  resendEmail(@Body() invitationIdsBody: UserIdentifiers) {
    return this.invitationService.resendEmail(invitationIdsBody);
  }

  @Post(':token/validate')
  @HttpCode(200)
  @UseInterceptors(
    new UserLogInterceptor({
      category: userLogCategory.GENERAL,
    }),
  )
  validateToken(@Param('token') token: string) {
    return this.invitationService.validateToken(token);
  }
}
