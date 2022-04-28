import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
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
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { LearningTrackDirectAccess } from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccess.entity';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { LearningTrackDirectAccessUploadHistory } from '@seaccentral/core/dist/learning-track/LearningTrackDirectAccessUploadHistory.entity';
import { LearningTrackDirectAccessBody } from './dto/LearningTrackDirectAccessBody.dto';
import { LearningTrackDirectAccessBulkUploadBody } from './dto/LearningTrackDirectAccessBulkUploadBody.dto';
import { LearningTrackDirectAccessQueryDto } from './dto/LearningTrackDirectAccessQuery.dto';
import { TranslatedLearningTrackDirectAccessResponse } from './dto/LearningTrackDirectAccessResponse.dto';
import { LearningTrackAccessControlService } from './learningTrackAccessControl.service';

@Controller('v1/learning-tracks-direct-access')
@ApiTags('Learning Track Direct Access')
@ApiSecurity('auth_token')
export class LearningTrackDirectAccessController {
  private readonly logger = new Logger(
    LearningTrackDirectAccessController.name,
  );

  constructor(
    private readonly learningTrackAccessControlService: LearningTrackAccessControlService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackDirectAccessController.prototype.list),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('')
  async list(
    @Query() query: LearningTrackDirectAccessQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode = LanguageCode.EN,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { data, count } =
      await this.learningTrackAccessControlService.listLearningTrackDirectAccess(
        {
          ...query,
          skip,
          take,
        },
      );

    const response = new BaseResponseDto<
      TranslatedLearningTrackDirectAccessResponse[]
    >();
    response.data = data.map(
      (d) => new TranslatedLearningTrackDirectAccessResponse(d, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackDirectAccessController.prototype.create),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('')
  async create(@Body() learningTrackAccessBody: LearningTrackDirectAccessBody) {
    const response = new BaseResponseDto<LearningTrackDirectAccess>();
    const learningTrackAccess =
      await this.learningTrackAccessControlService.addDirectAccessToLearningTrack(
        learningTrackAccessBody,
      );

    response.data = learningTrackAccess;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackDirectAccessController.prototype.update),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() learningTrackDirectAccessBody: LearningTrackDirectAccessBody,
  ) {
    await this.learningTrackAccessControlService.updateLearningTrackDirectAccess(
      id,
      learningTrackDirectAccessBody,
    );
  }

  @Delete('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackDirectAccessController.prototype.delete),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  delete(@Body() idsBody: UserIdentifiers) {
    this.learningTrackAccessControlService
      .deleteMany(idsBody.ids)
      .catch((err) =>
        this.logger.error('Error deleting learning track direct access: ', err),
      );
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackDirectAccessController.prototype.bulkUpload),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('bulk-upload')
  async bulkUpload(
    @Body() body: LearningTrackDirectAccessBulkUploadBody,
    @Req() request: IRequestWithUser,
  ) {
    await this.learningTrackAccessControlService.recordBulkUploadHistory(
      body.metadata,
      request.user,
    );

    this.learningTrackAccessControlService
      .bulkUpload(body)
      .catch((err) =>
        this.logger.error(
          'Error bulk uploading learning track direct access: ',
          err,
        ),
      );
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      LearningTrackDirectAccessController.prototype.getBulkUploadHistory,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('bulk-upload-history')
  async getBulkUploadHistory(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<
      LearningTrackDirectAccessUploadHistory[]
    >();
    const [data, count] =
      await this.learningTrackAccessControlService.getBulkUploadHistory({
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
