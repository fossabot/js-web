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
  Headers,
  Req,
  NotFoundException,
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
import { createPresignedGet } from '@seaccentral/core/dist/utils/s3';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';

import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { PushNotificationSubCategoryKey } from '@seaccentral/core/dist/notification/enum/PushNotificationSubCategory.enum';
import { NotificationVariableDict as NV } from '@seaccentral/core/dist/notification/NotificationVariableDict';

import { LearningTrackService } from './learningTrack.service';
import { LearningTrackQueryDto } from './dto/learningTrackQuery.dto';
import {
  CreateLearningTrackBody,
  UpdateLearningTrackBody,
} from './dto/learningTrack.dto';
import {
  LearningTrackResponseDto,
  TranslatedLearningTrackResponseDto,
} from './dto/learningTrackResponse.dto';
import { LearningTrackSearchService } from './learningTrackSearch.service';
import { LearningTrackSearchQueryDto } from './dto/LearningTrackSearchQuery.dto';
import { InternalMaterialsService } from '../materials/internalMaterials.service';
import { LearningTrackSearchResponseDto } from './dto/LearningTrackSearchResponse.dto';
import { LearningTrackHasCertificateQueryDto } from './dto/LearningTrackHasCertificateQuery.dto';

@Controller('v1/learning-tracks')
@ApiTags('Learning Track')
@ApiSecurity('auth_token')
export class LearningTrackController {
  constructor(
    private readonly learningTrackSearchService: LearningTrackSearchService,
    private readonly learningTrackService: LearningTrackService,
    private readonly internalMaterialService: InternalMaterialsService,
    private readonly connection: Connection,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('has-certificate')
  async hasCertificate(@Body() query: LearningTrackHasCertificateQueryDto) {
    const response = new BaseResponseDto<{ [key: string]: boolean }>();
    const result =
      await this.learningTrackService.checkLearningTracksHaveLinkedCertificate(
        query.ids,
      );
    response.data = result;
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackController.prototype.getAll),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getAll(
    @Query() query: LearningTrackQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<
      TranslatedLearningTrackResponseDto[]
    >();
    const result = await this.learningTrackService.findAll({
      ...query,
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });
    response.data = result.data.map(
      (learningTrack: LearningTrack) =>
        new TranslatedLearningTrackResponseDto(learningTrack, acceptLanguage),
    );
    response.pagination = getPaginationResponseParams(query, result.count);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackController.prototype.create),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('')
  async create(@Body() learningTrackDto: CreateLearningTrackBody) {
    const response = new BaseResponseDto<LearningTrack>();
    const learningTrack = await this.learningTrackService.create(
      learningTrackDto,
    );

    response.data = learningTrack;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('search')
  async searchLearningTracks(
    @Query() query: LearningTrackSearchQueryDto,
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Req() req: IRequestWithUser,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { data, certificateDict, count } =
      await this.learningTrackService.search(query, skip, take, req.user);
    const response = new BaseResponseDto<LearningTrackSearchResponseDto[]>();
    const learningTrack = data.map(
      (item) =>
        new LearningTrackSearchResponseDto(
          item,
          acceptLanguage,
          certificateDict[item.id] || false,
        ),
    );

    response.data = learningTrack;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackController.prototype.update),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() learningTrackDto: UpdateLearningTrackBody,
  ) {
    const learningTrack = await this.connection.transaction((manager) => {
      return this.learningTrackService
        .withTransaction(manager)
        .update(id, learningTrackDto);
    });

    this.learningTrackService.updateSearchEntry(learningTrack, true);
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackController.prototype.getById),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = new BaseResponseDto<LearningTrackResponseDto>();

    const learningTrack = await this.learningTrackService.findById(id);
    const data = new LearningTrackResponseDto(learningTrack);
    response.data = data;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/detail')
  async details(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const response = new BaseResponseDto<TranslatedLearningTrackResponseDto>();
    const learningTrack = await this.learningTrackService.findDetail(
      id,
      req.user,
    );
    const data = new TranslatedLearningTrackResponseDto(
      learningTrack,
      acceptLanguage,
    );
    response.data = data;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post(':id/enroll')
  async enroll(
    @Param('id') learningTrackId: string,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto<{ success: boolean }>();

    const [enrollStatus, learningTrack] = await Promise.all([
      this.learningTrackService.enroll(learningTrackId, req.user),
      this.learningTrackService.findById(learningTrackId),
    ]);

    response.data = enrollStatus;

    if (enrollStatus.success)
      this.notificationProducer
        .notify(
          PushNotificationSubCategoryKey.LEARNING_ACTIVITY_LEARNING_TRACK_ENROLLMENT,
          req.user.id,
          {
            [NV.LEARNING_TRACK_NAME.alias]: learningTrack.title,
          },
        )
        .catch();

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(LearningTrackController.prototype.delete),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ADMIN_PORTAL,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @Delete('')
  async delete(@Body('ids') ids: string[]) {
    await this.connection.transaction(async (manager) => {
      await this.learningTrackService.withTransaction(manager).deleteMany(ids);
    });

    this.learningTrackSearchService.removeIndex(ids.join(' '));
  }

  @Get(':id/download-material/:materialId')
  @UseGuards(JwtAuthGuard)
  async generateDownloadUrl(
    @Param('id') id: string,
    @Param('materialId') materialId: string,
  ) {
    const learningTrack = await this.learningTrackService.findById(id);

    if (
      !learningTrack.learningTrackMaterial.find(
        (ltm) => ltm.material.id === materialId,
      )
    ) {
      throw new NotFoundException(`material id ${materialId} not found`);
    }

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
}
