import {
  Query,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  Put,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import {
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
import { CourseDirectAccess } from '@seaccentral/core/dist/course/CourseDirectAccess.entity';
import { CourseDirectAccessUploadHistory } from '@seaccentral/core/dist/course/CourseDirectAccessUploadHistory.entity';

import { CourseDirectAccessBody } from './dto/CourseDirectAccessBody.dto';
import { CourseAccessControlService } from './courseAccessControl.service';
import { CourseDirectAccessQueryDto } from './dto/CourseDirectAccessQuery.dto';
import { TranslatedCourseDirectAccessResponse } from './dto/CourseDirectAccessResponse.dto';
import { CourseDirectAccessBulkUploadBody } from './dto/CourseDirectAccessBulkUploadBody.dto';

@Controller('v1/course-direct-access')
@ApiTags('Course Direct Access')
@ApiSecurity('auth_token')
export class CourseDirectAccessController {
  private readonly logger = new Logger(CourseDirectAccessController.name);

  constructor(
    private readonly courseAccessControlService: CourseAccessControlService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseDirectAccessController.prototype.list),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('')
  async list(
    @Query() query: CourseDirectAccessQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode = LanguageCode.EN,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { data, count } =
      await this.courseAccessControlService.listCourseDirectAccess({
        ...query,
        skip,
        take,
      });

    const response = new BaseResponseDto<
      TranslatedCourseDirectAccessResponse[]
    >();
    response.data = data.map(
      (d) => new TranslatedCourseDirectAccessResponse(d, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseDirectAccessController.prototype.create),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('')
  async create(@Body() courseDirectAccessBody: CourseDirectAccessBody) {
    const response = new BaseResponseDto<CourseDirectAccess>();
    const courseDirectAccess =
      await this.courseAccessControlService.addDirectAccessToCourse(
        courseDirectAccessBody,
      );

    response.data = courseDirectAccess;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseDirectAccessController.prototype.update),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() courseDirectAccessBody: CourseDirectAccessBody,
  ) {
    await this.courseAccessControlService.updateCourseDirectAccess(
      id,
      courseDirectAccessBody,
    );
  }

  @Delete('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseDirectAccessController.prototype.delete),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  delete(@Body() idsBody: UserIdentifiers) {
    this.courseAccessControlService
      .deleteMany(idsBody.ids)
      .catch((err) =>
        this.logger.error('Error deleting course direct access: ', err),
      );
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseDirectAccessController.prototype.bulkUpload),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('bulk-upload')
  async bulkUpload(
    @Body() body: CourseDirectAccessBulkUploadBody,
    @Req() request: IRequestWithUser,
  ) {
    await this.courseAccessControlService.recordBulkUploadHistory(
      body.metadata,
      request.user,
    );

    this.courseAccessControlService
      .bulkUpload(body)
      .catch((err) =>
        this.logger.error('Error bulk uploading course direct access: ', err),
      );
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseDirectAccessController.prototype.getBulkUploadHistory),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('bulk-upload-history')
  async getBulkUploadHistory(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<CourseDirectAccessUploadHistory[]>();
    const [data, count] =
      await this.courseAccessControlService.getBulkUploadHistory({
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
