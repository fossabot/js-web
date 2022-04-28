import { ModuleRef } from '@nestjs/core';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { flatMap, uniq } from 'lodash';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { IListParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { Certificate } from '@seaccentral/core/dist/certificate/certificate.entity';
import { CertificateUnlockRule } from '@seaccentral/core/dist/certificate/CertificateUnlockRule.entity';
import { CertificateUnlockRuleCourseItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleCourseItem.entity';
import { CertificateUnlockRuleLearningTrackItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleLearningTrackItem.entity';

import {
  CreateCertificateUnlockRuleBody,
  UpdateCertificateUnlockRuleBody,
} from './dto/CertificateUnlockRuleBody.dto';
import { CourseSearchService } from '../course/courseSearch.service';
import { LearningTrackSearchService } from '../learning-track/learningTrackSearch.service';
import { UserCourseProgressService } from '../course/userCourseProgress.service';

@Injectable()
export class CertificateUnlockRuleService extends TransactionFor<CertificateUnlockRuleService> {
  @Inject(CourseSearchService)
  private courseSearchService: CourseSearchService;

  @Inject(LearningTrackSearchService)
  private learningTrackSearchService: LearningTrackSearchService;

  constructor(
    @InjectRepository(CertificateUnlockRule)
    private certificateUnlockRuleRepository: Repository<CertificateUnlockRule>,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(CertificateUnlockRuleCourseItem)
    private certificateUnlockRuleCourseItemRepository: Repository<CertificateUnlockRuleCourseItem>,
    @InjectRepository(CertificateUnlockRuleLearningTrackItem)
    private certificateUnlockRuleLearningTrackItemRepository: Repository<CertificateUnlockRuleLearningTrackItem>,
    private userCourseProgressService: UserCourseProgressService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async listRules(query: IListParams) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const result = await this.certificateUnlockRuleRepository.findAndCount({
      where: {
        ...searchField,
        isActive: true,
      },
      take: query.take,
      skip: query.skip,
      order: {
        ...orderByField,
      },
      relations: ['createdBy', 'lastModifiedBy', 'certificate'],
    });

    return result;
  }

  async getRuleById(id: string) {
    const certificateUnlockRule = await this.certificateUnlockRuleRepository
      .createQueryBuilder('certificateUnlockRule')
      .leftJoinAndSelect('certificateUnlockRule.createdBy', 'createdBy')
      .leftJoinAndSelect(
        'certificateUnlockRule.lastModifiedBy',
        'lastModifiedBy',
      )
      .leftJoinAndSelect(
        'certificateUnlockRule.courseRuleItems',
        'courseRuleItems',
      )
      .leftJoinAndSelect('certificateUnlockRule.certificate', 'certificate')
      .leftJoinAndSelect('courseRuleItems.course', 'course')
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect(
        'certificateUnlockRule.learningTrackRuleItems',
        'learningTrackRuleItems',
      )
      .leftJoinAndSelect(
        'learningTrackRuleItems.learningTrack',
        'learningTrack',
      )
      .leftJoinAndSelect('learningTrack.title', 'learningTrackTitle')
      .where('certificateUnlockRule.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('certificateUnlockRule.id = :certificateUnlockRuleId', {
        certificateUnlockRuleId: id,
      })
      .getOne();

    if (!certificateUnlockRule) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Certificate unlock rule not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return certificateUnlockRule;
  }

  async create(
    certificateUnlockRuleBody: CreateCertificateUnlockRuleBody,
    user: User,
  ) {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateUnlockRuleBody.certificateId },
    });

    if (!certificate) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Certificate not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const certificateUnlockRuleData =
      this.certificateUnlockRuleRepository.create({
        ...certificateUnlockRuleBody,
        certificate,
        createdBy: user,
        lastModifiedBy: user,
        unlockType: certificateUnlockRuleBody.unlockType,
        courseRuleItems: this.certificateUnlockRuleCourseItemRepository.create(
          certificateUnlockRuleBody.unlockCourseRuleItems.map((cucri) => ({
            ...cucri,
            course: { id: cucri.courseId },
          })),
        ),
        learningTrackRuleItems:
          this.certificateUnlockRuleLearningTrackItemRepository.create(
            certificateUnlockRuleBody.unlockLearningTrackRuleItems.map(
              (cultri) => ({
                ...cultri,
                learningTrack: { id: cultri.learningTrackId },
              }),
            ),
          ),
      });

    const certificateUnlockRule =
      await this.certificateUnlockRuleRepository.save(
        certificateUnlockRuleData,
      );

    if (certificateUnlockRuleBody?.unlockCourseRuleItems?.length) {
      const ids = certificateUnlockRuleBody.unlockCourseRuleItems.map(
        (it) => it.courseId,
      );
      await this.courseSearchService.updateCourseCertificates(true, ids);
    } else if (
      certificateUnlockRuleBody?.unlockLearningTrackRuleItems?.length
    ) {
      const ids = certificateUnlockRuleBody.unlockLearningTrackRuleItems.map(
        (it) => it.learningTrackId,
      );
      await this.learningTrackSearchService.updateLearningTrackCertificates(
        true,
        ids,
      );
    }

    return certificateUnlockRule;
  }

  async update(
    id: string,
    certificateUnlockRuleBody: UpdateCertificateUnlockRuleBody,
    user: User,
  ) {
    const oldCertificateUnlockRule = await this.certificateUnlockRuleRepository
      .createQueryBuilder('unlockRule')
      .leftJoinAndSelect('unlockRule.courseRuleItems', 'courseRuleItems')
      .leftJoinAndSelect(
        'unlockRule.learningTrackRuleItems',
        'learningTrackRuleItems',
      )
      .where({ id, isActive: true })
      .getOneOrFail();

    if (!oldCertificateUnlockRule) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Certificate unlock rule does not exist, id = "${id}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const certificate = await this.certificateRepository.findOne({
      where: { id: oldCertificateUnlockRule.certificateId },
    });

    if (!certificate) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Certificate not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await Promise.all([
      this.certificateUnlockRuleCourseItemRepository.delete({
        unlockRule: oldCertificateUnlockRule,
      }),
      this.certificateUnlockRuleLearningTrackItemRepository.delete({
        unlockRule: oldCertificateUnlockRule,
      }),
    ]);

    const certificateUnlockRuleUpdateData =
      this.certificateUnlockRuleRepository.create({
        ...certificateUnlockRuleBody,
        id,
        certificate,
        lastModifiedBy: user,
        unlockType: certificateUnlockRuleBody.unlockType,
        courseRuleItems: this.certificateUnlockRuleCourseItemRepository.create(
          certificateUnlockRuleBody.unlockCourseRuleItems.map((cucri) => ({
            ...cucri,
            course: { id: cucri.courseId },
          })),
        ),
        learningTrackRuleItems:
          this.certificateUnlockRuleLearningTrackItemRepository.create(
            certificateUnlockRuleBody.unlockLearningTrackRuleItems.map(
              (cultri) => ({
                ...cultri,
                learningTrack: { id: cultri.learningTrackId },
              }),
            ),
          ),
      });

    const updatedCertificateUnlockRule =
      await this.certificateUnlockRuleRepository.save(
        certificateUnlockRuleUpdateData,
      );

    await this.userCourseProgressService.evaluateUserCertificate(
      updatedCertificateUnlockRule.certificateId,
    );

    return updatedCertificateUnlockRule;
  }

  async deleteMany(ids: string[]) {
    await this.certificateUnlockRuleRepository.delete({ id: In(ids) });
  }

  async reindexAllUnlockRuleItems() {
    const unlockRules = await this.getAllUnlockRules([]);

    const courseRuleItems = uniq(
      flatMap(unlockRules.map((it) => it.courseRuleItems)).map(
        (it) => it.courseId,
      ),
    );
    const learningTrackRuleItems = uniq(
      flatMap(unlockRules.map((it) => it.learningTrackRuleItems)).map(
        (it) => it.learningTrackId,
      ),
    );

    // Clear all certificate badges.
    await this.courseSearchService.updateCourseCertificates(false);
    await this.learningTrackSearchService.updateLearningTrackCertificates(
      false,
    );

    // Reassign certificate badges
    if (courseRuleItems?.length) {
      await this.courseSearchService.updateCourseCertificates(
        true,
        courseRuleItems,
      );
    }
    if (learningTrackRuleItems?.length) {
      await this.learningTrackSearchService.updateLearningTrackCertificates(
        true,
        learningTrackRuleItems,
      );
    }
  }

  async getAllUnlockRules(
    ruleArr: CertificateUnlockRule[],
    page = 1,
  ): Promise<CertificateUnlockRule[]> {
    const take = 1000;
    const skip = page > 1 ? take * (page - 1) : 0;

    const unlockRules = await this.certificateUnlockRuleRepository
      .createQueryBuilder('unlockRule')
      .leftJoinAndSelect('unlockRule.courseRuleItems', 'courseRuleItems')
      .leftJoinAndSelect(
        'unlockRule.learningTrackRuleItems',
        'learningTrackRuleItems',
      )
      .where({ isActive: true })
      .skip(skip)
      .take(take)
      .getMany();

    if (unlockRules.length < 1) return ruleArr;

    ruleArr = ruleArr.concat(unlockRules);
    return this.getAllUnlockRules(ruleArr, page + 1);
  }
}
