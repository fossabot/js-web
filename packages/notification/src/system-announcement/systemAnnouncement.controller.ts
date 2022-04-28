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
  Patch,
  Post,
  Query,
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
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { SystemAnnouncement } from '@seaccentral/core/dist/notification/SystemAnnouncement.entity';
import * as s3UrlConditionBuilder from '@seaccentral/core/dist/utils/s3UrlConditionBuilder';
import { UploadService } from '../upload/upload.service';
import { S3_SYSTEM_ANNOUNCEMENT_FOLDER } from '../utils/constants';
import { SaveSystemAnnouncementDto } from './dto/SaveSystemAnnouncement.dto';
import { SaveSystemAnnouncementImagesDto } from './dto/SaveSystemAnnouncementImages.dto';
import { UpdateSystemAnnouncementStatusDto } from './dto/UpdateSystemAnnouncementStatus.dto';
import { SystemAnnouncementService } from './systemAnnouncement.service';

@Controller('v1/system-announcement')
@ApiTags('SystemAnnouncement')
@ApiSecurity('auth_token')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class SystemAnnouncementController {
  constructor(
    private readonly systemAnnouncementService: SystemAnnouncementService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(SystemAnnouncementController.prototype.getSystemAnnouncements),
  )
  async getSystemAnnouncements(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);

    const { announcements, count } =
      await this.systemAnnouncementService.findAll({ ...query, skip, take });

    const response = new BaseResponseDto<SystemAnnouncement[]>();

    response.data = announcements;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Patch(':id/status')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(SystemAnnouncementController.prototype.patchSystemAnnouncement),
  )
  patchSystemAnnouncement(
    @Param('id') id: string,
    @Body() dto: UpdateSystemAnnouncementStatusDto,
  ) {
    return this.systemAnnouncementService.updateSystemAnnouncementStatus(
      id,
      dto.isActive,
    );
  }

  @Delete(':id')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(
      SystemAnnouncementController.prototype.deleteSystemAnnouncement,
    ),
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSystemAnnouncement(@Param('id') id: string) {
    return this.systemAnnouncementService.deleteById(id);
  }

  @Get(':id/detail')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(SystemAnnouncementController.prototype.getSystemAnnouncement),
  )
  async getSystemAnnouncement(@Param('id') id: string) {
    const response = new BaseResponseDto<SystemAnnouncement>();
    const announcement = await this.systemAnnouncementService.findOne(id);

    response.data = announcement;

    return response;
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActiveSystemAnnouncement(@Headers('Now') now: string) {
    const response = new BaseResponseDto<SystemAnnouncement | null>();
    const announcement = await this.systemAnnouncementService.getActive(now);
    response.data = announcement || null;

    return response;
  }

  @Post('images')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(SystemAnnouncementController.prototype.uploadImages),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT)
  async uploadImages(@Body() dto: SaveSystemAnnouncementImagesDto) {
    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: 'system-announcement',
      folder: S3_SYSTEM_ANNOUNCEMENT_FOLDER,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_SYSTEM_ANNOUNCEMENT_FOLDER),
        s3UrlConditionBuilder.maxSizeMB(5),
        s3UrlConditionBuilder.contentType(dto.mime as string),
      ),
    });
    const response = new BaseResponseDto<AWS.S3.PresignedPost>();
    response.data = s3PresignedUrl;

    return response;
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(SystemAnnouncementController.prototype.saveSystemAnnouncement),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_SYSTEM_ANNOUNCEMENT_MANAGEMENT)
  async saveSystemAnnouncement(@Body() dto: SaveSystemAnnouncementDto) {
    const systemAnnouncement =
      await this.systemAnnouncementService.saveSystemAnnouncement(dto);
    const response = new BaseResponseDto<SystemAnnouncement>();
    response.data = systemAnnouncement;

    return response;
  }
}
