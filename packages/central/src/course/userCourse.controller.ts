import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  Headers,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { GetAllEnrolledCoursesQueryDto } from './dto/GetAllEnrolledCoursesQuery.dto';
import { UserCourseService } from './userCourse.service';
import { UserCourseProgressService } from './userCourseProgress.service';

@Controller('v1/user-courses')
@ApiTags('User Course')
@ApiSecurity('auth_token')
export class UserCourseController {
  constructor(
    private readonly userCouresService: UserCourseService,
    private readonly userCouresProgressService: UserCourseProgressService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  async getAllEnrolledCourses(
    @Query() dto: GetAllEnrolledCoursesQueryDto,
    @Req() req: IRequestWithUser,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const response = new BaseResponseDto();
    const { courses, count } =
      await this.userCouresService.getAllEnrolledCourses(
        req.user,
        dto,
        acceptLanguage,
      );
    response.data = courses;
    response.pagination = getPaginationResponseParams(dto, count);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('statuses')
  async getAllEnrolledCourseStatuses(
    @Query() dto: GetAllEnrolledCoursesQueryDto,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();
    const statuses = await this.userCouresService.getAllEnrolledCourseStatuses(
      req.user,
      dto,
    );
    response.data = statuses;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('archived-courses')
  async addArchiveCourse(
    @Body('courseId') courseId: string,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();
    const result = await this.userCouresService.addArchiveCourse(
      courseId,
      req.user,
    );
    response.data = result.id;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('archived-courses')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeArchiveCourse(
    @Body('courseId') courseId: string,
    @Req() req: IRequestWithUser,
  ) {
    await this.userCouresService.removeArchiveCourse(courseId, req.user);
  }
}
