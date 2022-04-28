import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExternalAssessment } from '@seaccentral/core/dist/assessment/ExternalAssessment.entity';
import { Repository } from 'typeorm';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import urljoin from 'url-join';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { ERROR_CODES } from '@seaccentral/core/dist/error/errors';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  CreateAssessmentRequestBody,
  CreateAssessmentResponseBody,
  RegenerateAssessmentRequestBody,
  RegenerateAssessmentResponseBody,
} from './interface/IassessmentCenter';
import { UpdateAssessmentDto } from './dto/UpdateAssessment.dto';

@Injectable()
export class AssessmentCenterService extends TransactionFor<AssessmentCenterService> {
  private assessmentCenterApi: AxiosInstance;

  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(ExternalAssessment)
    private readonly externalAssessmentRepository: Repository<ExternalAssessment>,
    @InjectRepository(CourseOutline)
    private readonly courseOutlineRepository: Repository<CourseOutline>,
    private readonly configService: ConfigService,
  ) {
    super(moduleRef);
    this.assessmentCenterApi = axios.create({
      baseURL: this.configService.get('ASSESSMENT_CENTER_URL'),
      headers: {
        'x-central-token': this.configService.get('ASSESSMENT_CENTER_TOKEN'),
      },
    });
  }

  async createAssessment(params: {
    user: User;
    courseOutlineId: string;
    language?: LanguageCode;
  }) {
    const { user, courseOutlineId, language } = params;
    const outline = await this.getCourseOutline(courseOutlineId);
    const payload: CreateAssessmentRequestBody = {
      userid: user.id,
      name: user.firstName as string,
      surname: user.lastName as string,
      email: user.email as string,
      assessment_name: outline.assessmentName as string,
      notify_email: outline.assessmentNotifyEmailStatus,
      language: language === LanguageCode.EN ? 'EN' : 'TH',
    };
    const { data } =
      await this.assessmentCenterApi.post<CreateAssessmentResponseBody>(
        urljoin(outline.assessmentAPIEndpoint as string, 'request'),
        payload,
      );

    await this.externalAssessmentRepository.upsert(
      {
        externalId: data.assessmentid,
        status: data.status,
        assessmentUrl: data.assessment_link,
        vendor: 'SEAC Assessment Center',
        user,
        courseOutlineId,
      },
      ['userId', 'courseOutlineId'],
    );

    return data;
  }

  async getAssessment(courseOutlineId: string, user: User) {
    const assessment = await this.externalAssessmentRepository.findOne({
      courseOutlineId,
      user,
    });
    if (!assessment) {
      throw new NotFoundException({
        ...ERROR_CODES.ASSESSMENT_NOT_FOUND,
        data: {
          id: courseOutlineId,
        },
      });
    }

    return assessment;
  }

  async regenerateAssessment(params: {
    user: User;
    courseOutlineId: string;
    language?: LanguageCode;
  }) {
    const { user, courseOutlineId, language } = params;
    const outline = await this.getCourseOutline(courseOutlineId);
    const payload: RegenerateAssessmentRequestBody = {
      userid: user.id,
      name: user.firstName as string,
      surname: user.lastName as string,
      email: user.email as string,
      assessment_name: outline.assessmentName as string,
      notify_email: outline.assessmentNotifyEmailStatus,
      language: language === LanguageCode.EN ? 'EN' : 'TH',
    };

    const { data } =
      await this.assessmentCenterApi.post<RegenerateAssessmentResponseBody>(
        urljoin(outline.assessmentAPIEndpoint as string, 'regenerate'),
        payload,
      );

    await this.externalAssessmentRepository.upsert(
      {
        externalId: data.assessmentid,
        status: data.status,
        assessmentUrl: data.assessment_link,
        vendor: 'SEAC Assessment Center',
        user,
        courseOutlineId,
      },
      ['userId', 'courseOutlineId'],
    );

    return data;
  }

  async updateAssessment(dto: UpdateAssessmentDto) {
    const { assessmentid, status, assessment_link, reporturl, userid } = dto;

    const result = await this.externalAssessmentRepository.update(
      { externalId: assessmentid, userId: userid },
      {
        status,
        assessmentUrl: assessment_link,
        reportUrl: reporturl,
      },
    );

    return result;
  }

  private async getCourseOutline(courseOutlineId: string) {
    const outline = await this.courseOutlineRepository.findOne({
      id: courseOutlineId,
    });
    if (!outline) {
      throw new NotFoundException(
        `course outline id ${courseOutlineId} not found`,
      );
    }

    return outline;
  }

  async getByExternalId(externalId: string) {
    const result = await this.externalAssessmentRepository.findOne({
      where: { externalId },
      relations: ['user'],
    });
    if (!result) {
      throw new NotFoundException(
        `assessment external id ${externalId} not found`,
      );
    }

    return result;
  }
}
