import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Req,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
  Body,
} from '@nestjs/common';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { ExternalAssessment } from '@seaccentral/core/dist/assessment/ExternalAssessment.entity';
import { Connection, UpdateResult } from 'typeorm';
import { AssessmentCenterService } from './assessmentCenter.service';
import {
  CreateAssessmentResponseBody,
  RegenerateAssessmentResponseBody,
} from './interface/IassessmentCenter';
import { AssessmentCenterGuard } from './assessmentCenter.guard';
import { UpdateAssessmentDto } from './dto/UpdateAssessment.dto';
import { AssessmentProgressService } from './assessmentProgress.service';

@Controller('v1/assessment-center')
export class AssessmentCenterController {
  constructor(
    private readonly connection: Connection,
    private readonly assessmentCenterService: AssessmentCenterService,
    private readonly assessmentProgressService: AssessmentProgressService,
  ) {}

  @Post('webhook')
  @UseGuards(AssessmentCenterGuard)
  async updateAssessment(@Body() dto: UpdateAssessmentDto) {
    const updateResult = await this.connection.transaction(async (manager) => {
      const result = await this.assessmentCenterService
        .withTransaction(manager)
        .updateAssessment(dto);
      if (dto.status === 'Completed') {
        const assessment = await this.assessmentCenterService
          .withTransaction(manager)
          .getByExternalId(dto.assessmentid);
        await this.assessmentProgressService
          .withTransaction(manager)
          .complete(assessment.courseOutlineId, assessment.user);
      }

      return result;
    });
    const response = new BaseResponseDto<UpdateResult>();
    response.data = updateResult;

    return response;
  }

  @Post(':courseOutlineId')
  @UseGuards(JwtAuthGuard)
  async takeAssessment(
    @Req() req: IRequestWithUser,
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Param('courseOutlineId') courseOutlineId: string,
  ) {
    const assessmentResBody = await this.connection.transaction(
      async (manager) => {
        const resBody = await this.assessmentCenterService
          .withTransaction(manager)
          .createAssessment({
            user: req.user,
            courseOutlineId,
            language: acceptLanguage,
          });
        await this.assessmentProgressService
          .withTransaction(manager)
          .begin(courseOutlineId, req.user);

        return resBody;
      },
    );
    const response = new BaseResponseDto<CreateAssessmentResponseBody>();
    response.data = assessmentResBody;

    return response;
  }

  @Get(':courseOutlineId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAssessment(
    @Req() req: IRequestWithUser,
    @Param('courseOutlineId') courseOutlineId: string,
  ) {
    const response = new BaseResponseDto<ExternalAssessment>();
    const assessment = await this.assessmentCenterService.getAssessment(
      courseOutlineId,
      req.user,
    );
    response.data = assessment;

    return response;
  }

  @Put(':courseOutlineId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async retakeAssessment(
    @Req() req: IRequestWithUser,
    @Headers('accept-language') acceptLanguage: LanguageCode,
    @Param('courseOutlineId') courseOutlineId: string,
  ) {
    const response = new BaseResponseDto<RegenerateAssessmentResponseBody>();
    const assessmentRes =
      await this.assessmentCenterService.regenerateAssessment({
        user: req.user,
        courseOutlineId,
        language: acceptLanguage,
      });

    response.data = assessmentRes;

    return response;
  }
}
