import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { Connection } from 'typeorm';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { CourseService } from './course.service';
import { CourseOutlineService } from './courseOutline.service';
import { CourseSubscriptionPlanActivator } from './CourseSubscriptionPlan.activator';
import { CourseOutlineQueryDto } from './dto/CourseOutlineQuery.dto';
import { CourseOutlineResponse } from './dto/CourseOutlineResponse.dto';
import { TranslatedCourseOutlineResponseDto } from './dto/CourseResponse.dto';
import { UserScormProgressDto } from './dto/UserScormProgress.dto';
import { UserVideoProgressDto } from './dto/UserVideoProgress.dto';
import { UserCourseProgressService } from './userCourseProgress.service';

@Controller('v1/course-outlines')
@ApiTags('CourseOutline')
export class CourseOutlineController {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseOutlineService: CourseOutlineService,
    private readonly userCourseProgressService: UserCourseProgressService,
    private readonly connection: Connection,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseOutlineController.prototype.getAll),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getAll(
    @Query() query: CourseOutlineQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const response = new BaseResponseDto<
      TranslatedCourseOutlineResponseDto[]
    >();
    const { data, count } = await this.courseOutlineService.findAll(query);

    response.data = data.map(
      (courseOutline) =>
        new TranslatedCourseOutlineResponseDto(courseOutline, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(JwtAuthGuard, CourseSubscriptionPlanActivator)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':outlineId/progress-scorm')
  async updateProgress(
    @Param('outlineId') outlineId: string,
    @Body() userScormProgressDto: UserScormProgressDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.connection.transaction(async (manager) => {
      await this.courseOutlineService
        .withTransaction(manager)
        .updateScormProgress(outlineId, userScormProgressDto, req.user);

      await this.userCourseProgressService.recalculateByCourseOutline(
        req.user,
        outlineId,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/progress-scorm')
  async getScormProgress(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();

    response.data = await this.connection.transaction(async (manager) => {
      const { userScormProgress, courseOutlineId } =
        await this.courseOutlineService
          .withTransaction(manager)
          .findScormProgressById(id, req.user);

      await this.userCourseProgressService
        .withTransaction(manager, { excluded: [NotificationProducer] })
        .recalculateByCourseOutline(req.user, courseOutlineId);

      return userScormProgress;
    });

    return response;
  }

  @UseGuards(JwtAuthGuard, CourseSubscriptionPlanActivator)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id/progress-video')
  async updateVideoProgress(
    @Param('id') courseOutlineId: string,
    @Body() userVideoProgressDto: UserVideoProgressDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.connection.transaction(async (manager) => {
      const progress = await this.courseOutlineService
        .withTransaction(manager)
        .updateVideoProgress(courseOutlineId, userVideoProgressDto, req.user);

      await this.userCourseProgressService
        .withTransaction(manager, { excluded: [NotificationProducer] })
        .recalculateByCourseOutline(req.user, courseOutlineId);

      return progress;
    });
  }

  @UseGuards(JwtAuthGuard, CourseSubscriptionPlanActivator)
  @Post(':outlineId/validate')
  async validateSubscriptionPlan(
    @Param('outlineId') outlineId: string,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();

    const requiredCourseOutline =
      await this.courseService.checkCourseOutlineBookingEligibility(
        outlineId,
        req.user.id,
      );

    if (requiredCourseOutline) {
      const { courseOutline, isBookingEligible } =
        await this.courseService.findCourseOutlineById(
          requiredCourseOutline.courseOutlineId,
          req.user,
        );
      throw new ForbiddenException({
        ...ERROR_CODES.PREVIOUS_OUTLINE_NOT_BOOKED,
        data: {
          type: requiredCourseOutline,
          courseOutline: new CourseOutlineResponse(
            courseOutline,
            isBookingEligible,
          ),
        },
      });
    }

    return response;
  }
}
