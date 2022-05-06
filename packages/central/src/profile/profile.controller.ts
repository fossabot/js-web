import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import mime from 'mime';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

import { User } from '@seaccentral/core/dist/user/User.entity';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { deleteObjectFromS3 } from '@seaccentral/core/dist/utils/s3';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { CRMMemberService } from '@seaccentral/core/dist/crm/crmMember.service';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { UserLogInterceptor } from '@seaccentral/core/dist/user-log/userLogInterceptor.interceptor';
import {
  userLogCategory,
  userLogSubCategory,
} from '@seaccentral/core/dist/user-log/constants';
import * as s3UrlConditionBuilder from '@seaccentral/core/dist/utils/s3UrlConditionBuilder';

import { ProfileService } from './profile.service';
import { S3_AVATAR_FOLDER } from '../utils/constants';
import { UploadService } from '../upload/upload.service';
import { GetProfileInfoDto } from './dto/GetProfileInfo.dto';
import { UpdateProfileInfoDto } from './dto/UpdateProfileInfo.dto';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { UpdateEmailNotificationLanguage } from './dto/UpdateEmailNotificationLanguage.dto';

@Controller('v1/profile')
@ApiTags('Profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly crmMemberService: CRMMemberService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.PROFILE,
    }),
  )
  async getProfileInfo(@Req() request: IRequestWithUser) {
    const user = await this.profileService.getUserProfileInfo(request.user.id);
    const response = new BaseResponseDto<GetProfileInfoDto>();

    response.data = new GetProfileInfoDto(user);

    return response;
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(ProfileController.prototype.getUserProfileInfo),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async getUserProfileInfo(@Param('id') userId: string) {
    const user = await this.profileService.getUserProfileInfo(userId);
    const response = new BaseResponseDto<GetProfileInfoDto>();

    response.data = new GetProfileInfoDto(user);

    return response;
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.PROFILE,
      subCategory: userLogSubCategory.UPDATE_PROFILE_INFO,
    }),
  )
  async updateProfileInfo(
    @Req() request: Request,
    @Body() updateProfileInfo: UpdateProfileInfoDto,
  ) {
    const user = request.user as User;
    const updatedUser = await this.profileService.updateProfileInfo(
      user,
      updateProfileInfo,
    );
    if (user.seacId) {
      this.crmMemberService.updateMember(user.seacId).catch();
    }

    const response = new BaseResponseDto<GetProfileInfoDto>();

    response.data = new GetProfileInfoDto(updatedUser);

    return response;
  }

  @Patch('email-notification-language')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async updateEmailNotificationLanguage(
    @Req() request: Request,
    @Body() updateEmailNotificationLanguage: UpdateEmailNotificationLanguage,
  ) {
    const user = request.user as User;
    const updatedUser =
      await this.profileService.updateEmailNotificationLanguage(
        user,
        updateEmailNotificationLanguage.emailNotificationLanguage,
      );
    if (user.seacId) {
      this.crmMemberService.updateMember(user.seacId).catch();
    }

    const response = new BaseResponseDto<GetProfileInfoDto>();

    response.data = new GetProfileInfoDto(updatedUser);

    return response;
  }

  @Put(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(ProfileController.prototype.updateUserProfileInfo),
  )
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUserProfileInfo(
    @Param('id') userId: string,
    @Body() updateProfileInfo: UpdateProfileInfoDto,
  ) {
    const user = await this.profileService.getUserProfileInfo(userId);
    const updatedUser = await this.profileService.updateProfileInfo(
      user,
      updateProfileInfo,
    );
    if (user.seacId) {
      this.crmMemberService.updateMember(user.seacId).catch();
    }

    const response = new BaseResponseDto<GetProfileInfoDto>();

    response.data = new GetProfileInfoDto(updatedUser);

    return response;
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    ClassSerializerInterceptor,
    new UserLogInterceptor({
      category: userLogCategory.PROFILE,
      subCategory: userLogSubCategory.UPDATE_PROFILE_INFO,
    }),
  )
  async uploadAvatar(@Req() request: IRequestWithUser) {
    const { user } = request;
    const { profileImageKey } = user;
    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: user.id,
      folder: S3_AVATAR_FOLDER,
      expires: 300,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_AVATAR_FOLDER),
        s3UrlConditionBuilder.maxSizeMB(3),
        s3UrlConditionBuilder.contentType(mime.getType('jpg') as string),
      ),
    });
    await this.profileService.updateAvatar(user, s3PresignedUrl.fields.key);
    if (profileImageKey) {
      await deleteObjectFromS3(profileImageKey);
    }
    const response = new BaseResponseDto<AWS.S3.PresignedPost>();
    response.data = s3PresignedUrl;

    return response;
  }
}
