import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Readable } from 'stream';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { createPresignedGet } from '@seaccentral/core/dist/utils/s3';

import { CourseService } from '../course/course.service';
import { OrganizationService } from '../organization/organization.service';
import { CourseAccessControlService } from '../course/courseAccessControl.service';
import { UserAssignedCourseService } from '../user-assigned-course/userAssignedCourse.service';
import { LearningTrackAccessControlService } from '../learning-track/learningTrackAccessControl.service';
import { UserAssignedLearningTrackService } from '../user-assigned-learning-track/userAssignedLearningTrack.service';
import {
  S3_COURSE_DIRECT_ACCESS_FOLDER,
  S3_COURSE_IMAGES_FOLDER,
  S3_COURSE_SESSION_FOLDER,
  S3_LEARNING_TRACK_DIRECT_ACCESS_FOLDER,
  S3_LEARNING_TRACK_IMAGES_FOLDER,
  S3_ORGANIZATION_TYPE,
  S3_USER_ASSIGNED_COURSE_FOLDER,
  S3_USER_ASSIGNED_LEARNING_TRACK_FOLDER,
  S3_USER_FOLDER,
} from '../utils/constants';
import { UploadService } from './upload.service';
import { PrepareUploadBody } from './dto/PrepareUploadBody';
import { PrepareUploadResponse } from './dto/PrepareUploadResponse';

@Controller('v1/upload')
@ApiTags('Upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly userService: UsersService,
    private readonly courseService: CourseService,
    private readonly courseAccessControlService: CourseAccessControlService,
    private readonly learningTrackAccessControlService: LearningTrackAccessControlService,
    private readonly organizationService: OrganizationService,
    private readonly userAssignedCourseService: UserAssignedCourseService,
    private readonly userAssignedLearningTrackService: UserAssignedLearningTrackService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_UPLOAD)
  @Get('file/user')
  async getUploadedFile(@Query() query: { key: string }, @Res() res: Response) {
    const userUploadHistory =
      await this.userService.getUserUploadHistoryByFileKey(query.key);
    const { fileName, buffer } = await this.uploadService.getUploadedFile(
      userUploadHistory.file,
      query.key,
    );
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': (buffer as Blob).size,
    });
    stream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('file/user/presigned-url')
  async prepareUserUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      S3_USER_FOLDER,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('file/organization/:id/idp-metadata/presigned-url')
  async prepareIDPMetadataUpload(
    @Param('id') id: string,
    @Body() prepareUploadBody: PrepareUploadBody,
  ) {
    await this.organizationService.checkIsExist(id);
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      ['text/xml', 'application/xml'],
      `organization/${id}/${S3_ORGANIZATION_TYPE.IDP}`,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('file/organization/:id/idp-certificate/presigned-url')
  async prepareIDPCertificateUpload(
    @Param('id') id: string,
    @Body() prepareUploadBody: PrepareUploadBody,
  ) {
    await this.organizationService.checkIsExist(id);
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      ['application/x-x509-ca-cert'],
      `organization/${id}/${S3_ORGANIZATION_TYPE.IDP}`,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('file/organization/:id/sp-metadata/presigned-url')
  async prepareSPMetadataUpload(
    @Param('id') id: string,
    @Body() prepareUploadBody: PrepareUploadBody,
  ) {
    await this.organizationService.checkIsExist(id);
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      ['text/xml', 'application/xml'],
      `organization/${id}/${S3_ORGANIZATION_TYPE.SP}`,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('file/organization/:id/sp-certificate/presigned-url')
  async prepareSPCertificateUpload(
    @Param('id') id: string,
    @Body() prepareUploadBody: PrepareUploadBody,
  ) {
    await this.organizationService.checkIsExist(id);
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      ['application/x-x509-ca-cert'],
      `organization/${id}/${S3_ORGANIZATION_TYPE.SP}`,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Post('course/image/presigned-url')
  async prepareUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    const data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [],
      S3_COURSE_IMAGES_FOLDER,
    );
    response.data = data;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @Post('learning-tracks/image/presigned-url')
  async prepareUploadLearningTrackImage(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    const data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [],
      S3_LEARNING_TRACK_IMAGES_FOLDER,
    );
    response.data = data;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Get('file/course-session')
  async getCourseSessionUploadedFile(@Query() query: { key: string }) {
    await this.courseService.getCourseSessionUploadHistoryByS3Key(query.key);

    const response = new BaseResponseDto<string>();

    response.data = await createPresignedGet({
      Key: query.key,
      Expires: 60,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Get('file/course-direct-access')
  async getCourseDirectAccessUploadedFile(@Query() query: { key: string }) {
    await this.courseAccessControlService.getUploadHistoryByS3Key(query.key);

    const response = new BaseResponseDto<string>();

    response.data = await createPresignedGet({
      Key: query.key,
      Expires: 60,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @Get('file/learning-tracks-direct-access')
  async getLearningTrackDirectAccessUploadedFile(
    @Query() query: { key: string },
  ) {
    await this.learningTrackAccessControlService.getUploadHistoryByS3Key(
      query.key,
    );

    const response = new BaseResponseDto<string>();

    response.data = await createPresignedGet({
      Key: query.key,
      Expires: 60,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Get('file/user-assigned-course')
  async getUserAssignedCourseUploadedFile(@Query() query: { key: string }) {
    await this.userAssignedCourseService.getUploadHistoryByS3Key(query.key);

    const response = new BaseResponseDto<string>();

    response.data = await createPresignedGet({
      Key: query.key,
      Expires: 60,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @Get('file/user-assigned-learning-track')
  async getUserAssignedLearningTrackUploadedFile(
    @Query() query: { key: string },
  ) {
    await this.userAssignedLearningTrackService.getUploadHistoryByS3Key(
      query.key,
    );

    const response = new BaseResponseDto<string>();

    response.data = await createPresignedGet({
      Key: query.key,
      Expires: 60,
    });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Post('file/course-session/presigned-url')
  async prepareCourseSessionUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      S3_COURSE_SESSION_FOLDER,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Post('file/course-direct-access/presigned-url')
  async prepareCourseDirectAccessUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      S3_COURSE_DIRECT_ACCESS_FOLDER,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Post('file/learning-tracks-direct-access/presigned-url')
  async prepareLearningTrackDirectAccessUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      S3_LEARNING_TRACK_DIRECT_ACCESS_FOLDER,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT)
  @Post('file/user-assigned-course/presigned-url')
  async prepareUserAssignedCourseUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      S3_USER_ASSIGNED_COURSE_FOLDER,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT)
  @Post('file/user-assigned-learning-track/presigned-url')
  async prepareUserAssignedLearningTrackUpload(
    @Body() prepareUploadBody: PrepareUploadBody,
  ): Promise<BaseResponseDto<PrepareUploadResponse>> {
    const response = new BaseResponseDto<PrepareUploadResponse>();
    response.data = await this.uploadService.getS3PresignedUrl(
      prepareUploadBody,
      [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      S3_USER_ASSIGNED_LEARNING_TRACK_FOLDER,
    );
    return response;
  }
}
