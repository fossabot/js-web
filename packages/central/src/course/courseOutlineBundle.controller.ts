import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { CourseOutlineBundleService } from './courseOutlineBundle.service';
import {
  AllCourseOutlineBundleResponse,
  CourseOutlineBundleResponse,
  CreateCourseOutlineBundle,
  CreateCourseOutlineBundleResponse,
} from './dto/CourseOutlineBundle.dto';

@Controller('v1/course-outline-bundles')
@ApiSecurity('auth_token')
@ApiTags('CourseOutlineBundle')
export class CourseOutlineBundleController {
  constructor(
    private readonly courseOutlineBundleService: CourseOutlineBundleService,
  ) {}

  @Post('')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      CourseOutlineBundleController.prototype.createCourseOutlineBundle,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBaseResponse(CreateCourseOutlineBundleResponse)
  async createCourseOutlineBundle(@Body() body: CreateCourseOutlineBundle) {
    const response = new BaseResponseDto<CreateCourseOutlineBundleResponse>();

    response.data =
      await this.courseOutlineBundleService.createCourseOutlineBundle(body);

    return response;
  }

  @Get('')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseOutlineBundleController.prototype.getCourseOutlineBundle),
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @ApiBaseResponse(AllCourseOutlineBundleResponse, { pagination: true })
  async getAllCourseOutlineBundle(
    @Query(new ValidationPipe({ transform: true })) query: BaseQueryDto,
  ) {
    const response = new BaseResponseDto<AllCourseOutlineBundleResponse[]>();

    const [courseOutlineBundles, count] =
      await this.courseOutlineBundleService.getAllCourseOutlineBundle(query);

    response.pagination = getPaginationResponseParams(query, count);

    response.data = courseOutlineBundles.map(
      (cob) => new AllCourseOutlineBundleResponse(cob),
    );

    return response;
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseOutlineBundleController.prototype.getCourseOutlineBundle),
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @ApiBaseResponse(CourseOutlineBundleResponse)
  async getCourseOutlineBundle(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const response = new BaseResponseDto<CourseOutlineBundleResponse>();

    const results =
      await this.courseOutlineBundleService.getCourseOutlineBundleById(id);

    response.data = new CourseOutlineBundleResponse(results, acceptLanguage);

    return response;
  }

  @Put(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CourseOutlineBundleController.prototype.putCourseOutlineBundle),
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @ApiBaseResponse(CreateCourseOutlineBundleResponse)
  async putCourseOutlineBundle(
    @Param('id') id: string,
    @Body() body: CreateCourseOutlineBundle,
  ) {
    const response = new BaseResponseDto<CreateCourseOutlineBundleResponse>();

    response.data =
      await this.courseOutlineBundleService.updateCourseOutlineBundleId(
        id,
        body,
      );

    return response;
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      CourseOutlineBundleController.prototype.deleteCourseOutlineBundle,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourseOutlineBundle(@Param('id') id: string) {
    return this.courseOutlineBundleService.deleteCourseOutlineBundleId(id);
  }
}
