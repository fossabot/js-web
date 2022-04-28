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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { CourseRule } from '@seaccentral/core/dist/course/CourseRule.entity';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';

import { CourseRuleService } from './courseRule.service';
import { CourseRuleResponseDto } from './dto/CourseRuleResponse.dto';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import {
  CreateCourseRuleBody,
  GetCourseRuleByCourseOutlineQueryDto,
  UpdateCourseRuleBody,
} from './dto/CourseRule.dto';

@Controller('v1/course-rules')
@ApiTags('CourseRule')
export class CourseRuleController {
  constructor(private readonly courseRuleService: CourseRuleService) {}

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseRuleController.prototype.getAll))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getAll(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<CourseRuleResponseDto[]>();
    const [result, count] = await this.courseRuleService.findAll({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });

    response.data = result.map(
      (courseRule) => new CourseRuleResponseDto(courseRule),
    );
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseRuleController.prototype.create))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('')
  async create(
    @Body() body: CreateCourseRuleBody,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto<CourseRule>();
    const course = await this.courseRuleService.create(body, req.user);

    response.data = course;

    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseRuleController.prototype.update))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCourseRuleBody,
    @Req() req: IRequestWithUser,
  ) {
    await this.courseRuleService.update(id, body, req.user);
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseRuleController.prototype.getByCourseOutlines),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('course-outlines')
  async getByCourseOutlines(
    @Query() query: GetCourseRuleByCourseOutlineQueryDto,
  ) {
    const response = new BaseResponseDto<CourseRuleResponseDto[]>();

    const courseRules = await this.courseRuleService.findByCourseOutline(query);

    response.data = courseRules.map(
      (courseRule) => new CourseRuleResponseDto(courseRule),
    );
    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseRuleController.prototype.getById))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = new BaseResponseDto<CourseRuleResponseDto>();

    const courseRule = await this.courseRuleService.findById(id);
    const data = new CourseRuleResponseDto(courseRule);

    response.data = data;
    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(CourseRuleController.prototype.delete))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
  )
  @Delete('')
  async delete(@Body('ids') ids: string[]) {
    await this.courseRuleService.deleteMany(ids);
  }
}
