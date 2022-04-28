import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { CourseAccessCheckerService } from '@seaccentral/core/dist/course/courseAccessCheckerService.service';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Connection } from 'typeorm';
import { CourseDiscoveryService } from './course-discovery.service';
import { GetCourseDiscoveryDto } from './dto/GetCourseDiscovery.dto';
import { SaveCourseDiscoveryDto } from './dto/SaveCourseDiscovery.dto';

@ApiSecurity('auth_token')
@Controller('/v1/course-discovery')
@ApiTags('Course Discovery')
export class CourseDiscoveryController {
  constructor(
    private courseAccessCheckerService: CourseAccessCheckerService,
    private courseDiscoveryService: CourseDiscoveryService,
    private connection: Connection,
  ) {}

  private async getCourseDiscoveryResponse(
    user: User,
    acceptLanguage: LanguageCode,
  ) {
    const courseDiscoveries =
      await this.courseDiscoveryService.getCourseDiscovery(user);

    const response = new BaseResponseDto<GetCourseDiscoveryDto>();
    response.data = new GetCourseDiscoveryDto(
      courseDiscoveries,
      acceptLanguage,
    );

    return response;
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getCourseDiscovery(
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Req() req: IRequestWithUser,
  ) {
    const onlySubscribedCourses =
      await this.courseAccessCheckerService.shouldOnlyShowSubscribedCourses(
        req.user,
      );

    if (onlySubscribedCourses) {
      throw new ForbiddenException();
    }

    return this.getCourseDiscoveryResponse(req.user, acceptLanguage);
  }

  @Post('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseDiscoveryController.prototype.saveCourseDiscovery),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_DISCOVERY_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async saveCourseDiscovery(
    @Body() dto: SaveCourseDiscoveryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Req() req: IRequestWithUser,
  ) {
    await this.connection.transaction((manager) => {
      return this.courseDiscoveryService
        .withTransaction(manager, { excluded: [RedisCacheService] })
        .saveCourseDiscovery(dto);
    });

    return this.getCourseDiscoveryResponse(req.user, acceptLanguage);
  }
}
