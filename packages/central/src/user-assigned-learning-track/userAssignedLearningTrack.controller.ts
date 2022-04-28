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
import { UserAssignedLearningTrackUploadHistory } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrackUploadHistory.entity';

import { UserAssignedLearningTrackService } from './userAssignedLearningTrack.service';
import { UserAssignedLearningTrackQueryDto } from './dto/UserAssignedLearningTrackQuery.dto';
import { UserAssignedLearningTrackResponseDto } from './dto/UserAssignedLearningTrackResponse.dto';
import { CreateUserAssignedLearningTrackBody } from './dto/CreateUserAssignedLearningTrackBody.dto';
import { UpdateUserAssignedLearningTrackBody } from './dto/UpdateUserAssignedLearningTrackBody.dto';
import { UserAssignedLearningTrackBulkUploadBody } from './dto/UserAssignedLearningTrackBulkUploadBody.dto';

@ApiSecurity('auth_token')
@Controller('v1/user-assigned-learning-tracks')
@ApiTags('User Assigned Learning Tracks')
export class UserAssignedLearningTrackController {
  private readonly logger = new Logger(
    UserAssignedLearningTrackController.name,
  );

  constructor(
    private readonly userAssignedLearningTrackService: UserAssignedLearningTrackService,
  ) {}

  @Get('')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedLearningTrackController.prototype.getAll),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBaseResponse(UserAssignedLearningTrackResponseDto, { pagination: true })
  async getAll(
    @Query() query: UserAssignedLearningTrackQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode = LanguageCode.EN,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { data, count } =
      await this.userAssignedLearningTrackService.listAssignedLearningTracks(
        {
          ...query,
          skip,
          take,
        },
        acceptLanguage,
      );

    const response = new BaseResponseDto<
      UserAssignedLearningTrackResponseDto[]
    >();
    response.data = data.map(
      (d) => new UserAssignedLearningTrackResponseDto(d, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @Post('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      UserAssignedLearningTrackController.prototype.assignLearningTrackToUsers,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignLearningTrackToUsers(
    @Body() dto: CreateUserAssignedLearningTrackBody,
  ) {
    await this.userAssignedLearningTrackService.create(dto);
  }

  @Put(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      UserAssignedLearningTrackController.prototype.updateAssignedLearningTrack,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateAssignedLearningTrack(
    @Param('id') id: string,
    @Body() dto: UpdateUserAssignedLearningTrackBody,
  ) {
    await this.userAssignedLearningTrackService.update(id, dto);
  }

  @Delete('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedLearningTrackController.prototype.delete),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  delete(@Body() idsBody: UserIdentifiers) {
    this.userAssignedLearningTrackService
      .deleteMany(idsBody.ids)
      .catch((err) =>
        this.logger.error('Error deleting assigned learning tracks.', err),
      );
  }

  @Post('bulk-upload')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(UserAssignedLearningTrackController.prototype.bulkUpload),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkUpload(
    @Body() body: UserAssignedLearningTrackBulkUploadBody,
    @Req() request: IRequestWithUser,
  ) {
    await this.userAssignedLearningTrackService.recordBulkUploadHistory(
      body.metadata,
      request.user,
    );

    this.userAssignedLearningTrackService
      .bulkUpload(body)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) =>
        this.logger.error(
          'Error bulk uploading user assigned learning tracks: ',
          err,
        ),
      );
  }

  @Get('bulk-upload-history')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      UserAssignedLearningTrackController.prototype.getBulkUploadHistory,
    ),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async getBulkUploadHistory(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<
      UserAssignedLearningTrackUploadHistory[]
    >();
    const [data, count] =
      await this.userAssignedLearningTrackService.getBulkUploadHistory({
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
