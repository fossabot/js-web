import {
  Put,
  Post,
  Body,
  Param,
  Delete,
  Logger,
  HttpCode,
  UsePipes,
  UseGuards,
  HttpStatus,
  Controller,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { UserAssignedCourseUploadHistory } from '@seaccentral/core/dist/course/UserAssignedCourseUploadHistory.entity';

import { UserAssignedCourseService } from './userAssignedCourse.service';
import { UserAssignedCourseQueryDto } from './dto/UserAssignedCourseQuery.dto';
import { UserAssignedCourseResponseDto } from './dto/UserAssignedCourseResponse.dto';
import { CreateUserAssignedCourseBody } from './dto/CreateUserAssignedCourseBody.dto';
import { UpdateUserAssignedCourseBody } from './dto/UpdateUserAssignedCourseBody.dto';
import { UserAssignedCourseBulkUploadBody } from './dto/UserAssignedCourseBulkUploadBody.dto';

@ApiSecurity('auth_token')
@Controller('v1/user-assigned-courses')
@ApiTags('User Assigned Courses')
export class UserAssignedCourseController {
  private readonly logger = new Logger(UserAssignedCourseController.name);

  constructor(
    private readonly userAssignedCourseService: UserAssignedCourseService,
  ) {}

  @Get('')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedCourseController.prototype.getAll),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBaseResponse(UserAssignedCourseResponseDto, { pagination: true })
  async getAll(
    @Query() query: UserAssignedCourseQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode = LanguageCode.EN,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { data, count } =
      await this.userAssignedCourseService.listAssignedCourses(
        {
          ...query,
          skip,
          take,
        },
        acceptLanguage,
      );

    const response = new BaseResponseDto<UserAssignedCourseResponseDto[]>();
    response.data = data.map(
      (d) => new UserAssignedCourseResponseDto(d, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @Post('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedCourseController.prototype.assignCourseToUsers),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignCourseToUsers(@Body() dto: CreateUserAssignedCourseBody) {
    await this.userAssignedCourseService.create(dto);
  }

  @Put(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedCourseController.prototype.updateAssignedCourse),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateAssignedCourse(
    @Param('id') id: string,
    @Body() dto: UpdateUserAssignedCourseBody,
  ) {
    await this.userAssignedCourseService.update(id, dto);
  }

  @Delete('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedCourseController.prototype.delete),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  delete(@Body() idsBody: UserIdentifiers) {
    this.userAssignedCourseService
      .deleteMany(idsBody.ids)
      .catch((err) =>
        this.logger.error('Error deleting assigned courses.', err),
      );
  }

  @Post('bulk-upload')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedCourseController.prototype.bulkUpload),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkUpload(
    @Body() body: UserAssignedCourseBulkUploadBody,
    @Req() request: IRequestWithUser,
  ) {
    await this.userAssignedCourseService.recordBulkUploadHistory(
      body.metadata,
      request.user,
    );

    this.userAssignedCourseService
      .bulkUpload(body)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) =>
        this.logger.error('Error bulk uploading user assigned course: ', err),
      );
  }

  @Get('bulk-upload-history')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedCourseController.prototype.getBulkUploadHistory),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async getBulkUploadHistory(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<UserAssignedCourseUploadHistory[]>();
    const [data, count] =
      await this.userAssignedCourseService.getBulkUploadHistory({
        skip,
        take,
        search,
        searchField,
        order,
        orderBy,
      });

    response.data = data;
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }
}
