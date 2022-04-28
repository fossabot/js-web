import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { SyncAuthGuard } from '../guards/syncAuth.guard';
import { UserEnrolledCourseResponse } from './dto/UserEnrolledCourseResponse.dto';
import { UserEnrolledLearningTrackResponse } from './dto/UserEnrolledLearningTrackResponse.dto';
import UserActivityService from './userActivity.service';

@Controller('/v1/user-activity')
@ApiTags('User Activities')
export default class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @UseGuards(SyncAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('enrolled/courses')
  async getAllUserEnrolledCourses(@Query() query: BaseQueryDto) {
    const response = new BaseResponseDto<UserEnrolledCourseResponse[]>();
    const { courses, count } =
      await this.userActivityService.getAllUserEnrolledCourses(query);
    response.data = courses.map((it) => new UserEnrolledCourseResponse(it));
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(SyncAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('enrolled/learning-tracks')
  async getAllUserEnrolledLearningTracks(@Query() query: BaseQueryDto) {
    const response = new BaseResponseDto<UserEnrolledLearningTrackResponse[]>();
    const { learningTracks, count } =
      await this.userActivityService.getAllUserEnrolledLearningTracks(query);
    response.data = learningTracks.map(
      (it) => new UserEnrolledLearningTrackResponse(it),
    );
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }
}
