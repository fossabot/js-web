import {
  Query,
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Delete,
  Put,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
  NotFoundException,
  Headers,
  Request,
  CacheKey,
  CacheTTL,
  CacheInterceptor,
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { createPresignedGet } from '@seaccentral/core/dist/utils/s3';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import {
  PolicyActivatorGuard,
  PolicyGuard,
} from '@seaccentral/core/dist/access-control/policy.guard';
import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { CourseSession } from '@seaccentral/core/dist/course/CourseSession.entity';
import { CourseCategory } from '@seaccentral/core/dist/course/CourseCategory.entity';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { CourseSubCategory } from '@seaccentral/core/dist/course/CourseSubCategory.entity';
import { LearningContentFile } from '@seaccentral/core/dist/learning-content-file/LearningContentFile.entity';
import {
  userLogCategory,
  userLogSubCategory,
} from '@seaccentral/core/dist/user-log/constants';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { UserLogInterceptor } from '@seaccentral/core/dist/user-log/userLogInterceptor.interceptor';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';

import {
  CourseResponseDto,
  TranslatedCourseResponseDto,
} from './dto/CourseResponse.dto';
import {
  CreateCourseBody,
  CreateCourseOutlineBody,
  CreateCourseSessionBody,
  UpdateCourseBody,
  UpdateCourseOutlineBody,
  UpdateCourseSessionBody,
} from './dto/Course.dto';
import { CourseService } from './course.service';
import { CourseQueryDto } from './dto/CourseQuery.dto';
import { UserCourseService } from './userCourse.service';
import { CourseSearchService } from './courseSearch.service';
import { CourseSearchQueryDto } from './dto/CourseSearchQuery.dto';
import { LearningStatus } from './dto/GetAllEnrolledCoursesQuery.dto';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { CourseSessionResponse } from './dto/CourseSessionResponse.dto';
import { CourseOutlineResponse } from './dto/CourseOutlineResponse.dto';
import { CourseSearchResponseDto } from './dto/CourseSearchResponse.dto';
import { CourseHasCertificateQuery } from './dto/CourseHasCertificateQuery.dto';
import { TranslatedEnrollStatusResponse } from './dto/CourseEnrollResponse.dto';
import CourseMaterialDownloadActivator from './CourseMaterialDownload.activator';
import { InternalMaterialsService } from '../materials/internalMaterials.service';
import { CourseSubscriptionPlanActivator } from './CourseSubscriptionPlan.activator';

@Controller('v1/course')
@ApiTags('Course')
@ApiSecurity('auth_token')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseSearchService: CourseSearchService,
    private readonly internalMaterialService: InternalMaterialsService,
    private readonly userCourseService: UserCourseService,
    private readonly connection: Connection,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('search')
  async searchCourses(
    @Query() query: CourseSearchQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Request() req: IRequestWithUser,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { data, count, certificateDict } = await this.courseService.search(
      query,
      skip,
      take,
      req.user,
    );
    const response = new BaseResponseDto<CourseSearchResponseDto[]>();
    const course = data.map(
      (item) =>
        new CourseSearchResponseDto(
          item,
          acceptLanguage,
          certificateDict[item.id] || false,
        ),
    );
    response.data = course;
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('has-certificate')
  async hasCertificate(@Body() params: CourseHasCertificateQuery) {
    const response = new BaseResponseDto<{ [key: string]: boolean }>();
    const result = await this.courseService.findLinkedCertificates(params.ids);
    response.data = result;
    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseController.prototype.getAll))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getAll(
    @Query() query: CourseQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<TranslatedCourseResponseDto[]>();
    const result = await this.courseService.findAll({
      ...query,
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });
    response.data = result.data.map(
      (course: Course) =>
        new TranslatedCourseResponseDto(course, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(query, result.count);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/course-outline')
  async getAllCourseOutlines(
    @Param('id') courseId: string,
    @Req() req: IRequestWithUser,
    @Headers('Start-Of-Day') startOfToday: string,
    @Headers('End-Of-Range') endOfRange: string,
  ) {
    const response = new BaseResponseDto<CourseOutline[]>();
    const { courseOutlines, areEligible } =
      await this.courseService.findAllCourseOutlines(
        courseId,
        req.user,
        startOfToday,
        endOfRange,
      );

    response.data = courseOutlines.map(
      (outline, index) =>
        new CourseOutlineResponse(outline, areEligible[index]),
    );
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.getAllCourseSessions),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('course-outline/:id/course-session')
  async getAllCourseSessions(@Param('id') courseOutlineId: string) {
    const response = new BaseResponseDto<CourseSessionResponse[]>();
    const courseSessions = await this.courseService.findAllCourseSessions(
      courseOutlineId,
    );

    response.data = courseSessions.map((cs) => new CourseSessionResponse(cs));
    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('')
  async create(
    @Body() courseDto: CreateCourseBody,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto<Course>();
    const course = await this.courseService.create(courseDto, req.user);

    response.data = course;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(
    new UserLogInterceptor({
      category: userLogCategory.COURSE,
      subCategory: userLogSubCategory.ENROLL,
    }),
  )
  @Post(':id/enroll')
  async enroll(
    @Param('id') courseId: string,
    @Req() req: IRequestWithUser,
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Headers('Start-Of-Day') startOfToday: string,
    @Headers('End-Of-Range') endOfRange: string,
  ) {
    const response = new BaseResponseDto<TranslatedEnrollStatusResponse>();
    const { enrollStatus, course } = await this.courseService.enroll(
      courseId,
      req.user,
      startOfToday,
      endOfRange,
    );

    response.data = new TranslatedEnrollStatusResponse(
      enrollStatus,
      acceptLanguage,
    );

    if (enrollStatus.success && !enrollStatus.preRequisiteCourse)
      this.notificationProducer
        .notify(
          PushNotificationSubCategoryKey.LEARNING_ACTIVITY_COURSE_ENROLLMENT,
          req.user.id,
          {
            [NV.COURSE_NAME.alias]: course.title,
          },
        )
        .catch();

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.createCourseOutline),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post(':id/course-outline')
  async createCourseOutline(
    @Param('id') courseId: string,
    @Body() courseOutlineDto: CreateCourseOutlineBody,
  ) {
    const response = new BaseResponseDto<CourseOutline>();
    const courseOutline = await this.courseService.createCourseOutline(
      courseId,
      courseOutlineDto,
    );

    response.data = courseOutline;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.createCourseSession),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post(':id/course-outline/:courseOutlineId/course-session')
  async createCourseSession(
    @Param('id') courseId: string,
    @Param('courseOutlineId') courseOutlineId: string,
    @Body() courseSessionDto: CreateCourseSessionBody,
  ) {
    const response = new BaseResponseDto<CourseSession>();
    const courseSessions = await this.courseService.createCourseSession(
      courseId,
      courseOutlineId,
      courseSessionDto,
    );

    response.data = courseSessions;

    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseController.prototype.update))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() courseDto: UpdateCourseBody,
    @Req() req: IRequestWithUser,
  ) {
    await this.connection.transaction(async (manager) => {
      await this.courseService
        .withTransaction(manager)
        .update(id, courseDto, req.user);
    });
    const course = await this.courseService.findById(id);
    if (course && course.status === CourseStatus.Published) {
      this.courseSearchService.indexCourse(course);
    } else {
      this.courseSearchService.removeIndex(id);
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(
    new UserLogInterceptor({
      category: userLogCategory.COURSE,
    }),
  )
  @Get(':id/detail')
  async details(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
    @Headers('Accept-Language') acceptLanguage: LanguageCode = LanguageCode.EN,
    @Headers('Start-Of-Day') startOfToday: string,
    @Headers('End-Of-Range') endOfRange: string,
  ) {
    const course = await this.courseService.findDetail(
      id,
      req.user,
      startOfToday,
      endOfRange,
    );

    const response = new BaseResponseDto<TranslatedCourseResponseDto>();
    const data = new TranslatedCourseResponseDto(course, acceptLanguage);
    response.data = data;
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.updateCourseOutline),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Put(':id/course-outline/:courseOutlineId')
  async updateCourseOutline(
    @Param('id') courseId: string,
    @Param('courseOutlineId') courseOutlineId: string,
    @Body() courseOutlineDto: UpdateCourseOutlineBody,
  ) {
    await this.courseService.updateCourseOutline(
      courseId,
      courseOutlineId,
      courseOutlineDto,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.updateCourseSession),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Put('course-session/:id')
  async updateCourseSession(
    @Param('id') courseSessionId: string,
    @Body() courseSessionDto: UpdateCourseSessionBody,
  ) {
    await this.connection.transaction(async (manager) => {
      await this.courseService
        .withTransaction(manager)
        .updateCourseSession(courseSessionId, courseSessionDto);
    });
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.getCategories),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @UseInterceptors(CacheInterceptor)
  @CacheKey(cacheKeys.COURSE.CATEGORIES)
  @CacheTTL(86400)
  @Get('categories')
  async getCategories() {
    const response = new BaseResponseDto<CourseCategory[]>();
    const result = await this.courseService.findCategories();
    response.data = result;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.getSubCategories),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(CacheInterceptor)
  @CacheKey(cacheKeys.COURSE.SUB_CATEGORIES)
  @CacheTTL(86400)
  @Get('sub-categories')
  async getSubCategories() {
    const response = new BaseResponseDto<CourseSubCategory[]>();
    const result = await this.courseService.findSubCategories();
    response.data = result;

    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseController.prototype.getById))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = new BaseResponseDto<CourseResponseDto>();

    const course = await this.courseService.findById(id);
    const data = new CourseResponseDto(course);
    response.data = data;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(
    new UserLogInterceptor({
      category: userLogCategory.COURSE,
    }),
  )
  @Get('course-outline/:courseOutlineId')
  async getCourseOutlineById(
    @Request() req: IRequestWithUser,
    @Param('courseOutlineId') courseOutlineId: string,
  ) {
    const response = new BaseResponseDto<CourseOutlineResponse>();
    const { courseOutline, isBookingEligible } =
      await this.courseService.findCourseOutlineById(courseOutlineId, req.user);

    response.data = new CourseOutlineResponse(courseOutline, isBookingEligible);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.getCourseSessionById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('course-session/:id')
  async getCourseSessionById(@Param('id') courseSessionId: string) {
    const response = new BaseResponseDto<CourseSessionResponse>();
    const courseSession = await this.courseService.findCourseSessionById(
      courseSessionId,
    );

    response.data = new CourseSessionResponse(courseSession);
    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseController.prototype.delete))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Delete('')
  async delete(@Body('ids') ids: string[]) {
    await this.courseService.deleteMany(ids);
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.deleteCourseOutline),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Delete('course-outline')
  async deleteCourseOutline(@Body('ids') ids: string[]) {
    await this.courseService.deleteManyCourseOutlines(ids);
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseController.prototype.deleteCourseSession),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Delete('course-session')
  async deleteCourseSession(@Body('ids') ids: string[]) {
    await this.courseService.deleteManyCourseSessions(ids);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('learning-content/:contentId')
  async getLearningContent(@Param('contentId') contentId: string) {
    const response = new BaseResponseDto<LearningContentFile>();
    const content = await this.courseService.findLearningContentById(contentId);

    response.data = content;
    return response;
  }

  @Get(':courseId/download-material/:materialId')
  @UseGuards(
    JwtAuthGuard,
    PolicyActivatorGuard(
      CourseMaterialDownloadActivator,
      CourseController.prototype.generateDownloadUrl,
    ),
    CourseSubscriptionPlanActivator,
  )
  @UseInterceptors(
    new UserLogInterceptor({
      category: userLogCategory.COURSE,
    }),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  async generateDownloadUrl(@Param('materialId') materialId: string) {
    const material = await this.internalMaterialService.findOneMaterial({
      id: materialId,
    });

    if (!material) {
      throw new NotFoundException(`material id ${materialId} not found`);
    }

    const response = new BaseResponseDto<string>();
    response.data = await createPresignedGet({
      Key: material.key,
      Expires: 60,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(
    new UserLogInterceptor({
      category: userLogCategory.COURSE,
    }),
  )
  @Get(':id/media')
  async getAllCourseMedia(
    @Param('id') courseId: string,
    @Query('limit') limit = 0,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();
    const videos = await this.courseService.findAllCourseMedia(courseId, limit);
    const progress = await this.courseService.getCourseVideoProgress(
      courseId,
      req.user,
    );
    response.data = { videos, progress };
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/last-seen-video')
  async getLastVideo(
    @Param('id') courseId: string,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();
    response.data = await this.courseService.getLastSeenVideo(
      courseId,
      req.user,
    );

    // Get first video in playlist as a fallback video.
    if (!response.data) {
      const firstVideo = await this.courseService.getFirstVideo(courseId);
      response.data = firstVideo;
    }
    return response;
  }

  @UseGuards(JwtAuthGuard, CourseSubscriptionPlanActivator)
  @UseInterceptors(
    new UserLogInterceptor({
      category: userLogCategory.COURSE,
      subCategory: userLogSubCategory.VALIDATE_SUBSCRIPTION_PLAN,
    }),
  )
  @Post(':courseId/validate-subscription-plan')
  async validateSubscriptionPlan(@Param('courseId') courseId: string) {
    const response = new BaseResponseDto();

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/latest-in-progress')
  @UseInterceptors(ClassSerializerInterceptor)
  async getLatestInProgressCourse(
    @Req() req: IRequestWithUser,
    @Headers('Accept-Language') acceptLanguage: LanguageCode = LanguageCode.EN,
    @Headers('Start-Of-Day') startOfDay: string,
    @Headers('End-Of-Range') endOfRange: string,
  ) {
    const enrolledCourses = await this.userCourseService.getAllEnrolledCourses(
      req.user,
      {
        page: 1,
        perPage: 1,
        status: LearningStatus.IN_PROGRESS,
        orderBy: 'createdAt',
      } as any,
      acceptLanguage,
    );
    const response = new BaseResponseDto<TranslatedCourseResponseDto | null>();
    const mostRecentCourseId = enrolledCourses.courses[0]?.id;
    if (!mostRecentCourseId) {
      response.data = null;
      return response;
    }

    const course = await this.courseService.findDetail(
      enrolledCourses.courses[0].id,
      req.user,
      startOfDay,
      endOfRange,
    );
    response.data = new TranslatedCourseResponseDto(course, acceptLanguage);
    return response;
  }
}
