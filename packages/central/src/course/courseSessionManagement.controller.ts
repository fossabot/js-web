import { Response as ExpressResponse } from 'express';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Response,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';

import { CourseSessionManagementResponseDto } from './dto/course-sessions/CourseSessionManagementResponse.dto';
import { CourseSessionManagementQueryDto } from './dto/course-sessions/CourseSessionManagementQuery.dto';
import { CourseSessionManagementService } from './courseSessionManagement.service';
import { CourseSessionManagementDetailQueryDto } from './dto/course-sessions/CourseSessionManagementDetailQuery.dto';
import { CourseSessionDto } from './dto/course-sessions/CourseSessionResponse.dto';
import { GetSuggestionRequestDto } from './dto/course-sessions/GetSuggestionRequest.dto';

@Controller('v1/course-session-management')
@ApiTags('Course session management')
export class CourseSessionManagementController {
  constructor(
    private readonly sessionManagementService: CourseSessionManagementService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBaseResponse(CourseSessionManagementResponseDto, { pagination: true })
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Get('courses')
  async getCourses(@Query() query: CourseSessionManagementQueryDto) {
    const searchResult = await this.sessionManagementService.getCourses(query);
    const response = new BaseResponseDto<CourseSessionManagementResponseDto>();

    response.data = searchResult;
    response.pagination = getPaginationResponseParams(
      query,
      searchResult.totalCourseCount,
    );

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBaseResponse(CourseSessionDto)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Get('course-sessions')
  async getCourseSessions(
    @Query() query: CourseSessionManagementDetailQueryDto,
  ) {
    const courseSessions =
      await this.sessionManagementService.getCourseSessions(query);

    const response = new BaseResponseDto<CourseSessionDto>();
    response.data = courseSessions;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('suggestions')
  async getSuggestions(@Query() query: GetSuggestionRequestDto) {
    const result = await this.sessionManagementService.getSuggestions(query);

    const response = new BaseResponseDto<string[]>();
    response.data = result;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('reports')
  async getSessionReport(
    @Query() query: CourseSessionManagementQueryDto,
    @Response() res: ExpressResponse,
  ) {
    const report = await this.sessionManagementService.generateSessionReport(
      query,
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${report.fileName}`,
    );

    return report.stream.pipe(res);
  }
}
