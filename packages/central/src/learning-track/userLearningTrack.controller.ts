import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  Headers,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { GetAllEnrolledLearningTracksQueryDto } from './dto/GetAllEnrolledLearningTracksQuery.dto';
import { UserLearningTrackService } from './userLearningTrack.service';

@Controller('v1/user-learning-tracks')
@ApiTags('User Learning Track')
@ApiSecurity('auth_token')
export class UserLearningTrackController {
  constructor(
    private readonly userLearningTrackService: UserLearningTrackService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  async getAllEnrolledLearningTracks(
    @Query() dto: GetAllEnrolledLearningTracksQueryDto,
    @Req() req: IRequestWithUser,
    @Headers('accept-language') acceptLanguage: LanguageCode,
  ) {
    const response = new BaseResponseDto();
    const { learningTracks, count } =
      await this.userLearningTrackService.getAllEnrolledLearningTracks(
        req.user,
        dto,
        acceptLanguage,
      );
    response.data = learningTracks;
    response.pagination = getPaginationResponseParams(dto, count);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('statuses')
  async getAllEnrolledLearningTrackStatuses(
    @Query() dto: GetAllEnrolledLearningTracksQueryDto,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();
    const statuses =
      await this.userLearningTrackService.getAllEnrolledLearningTrackStatuses(
        req.user,
        dto,
      );
    response.data = statuses;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('archived-learning-tracks')
  async addArchiveLearningTrack(
    @Body('learningTrackId') learningTrackId: string,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto();
    const result = await this.userLearningTrackService.addArchiveLearningTrack(
      learningTrackId,
      req.user,
    );
    response.data = result.id;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('archived-learning-tracks')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeArchiveLearningTrack(
    @Body('learningTrackId') learningTrackId: string,
    @Req() req: IRequestWithUser,
  ) {
    await this.userLearningTrackService.removeArchiveLearningTrack(
      learningTrackId,
      req.user,
    );
  }
}
