import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { chunk, flatten } from 'lodash';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, In, Repository, TreeRepository } from 'typeorm';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Topic } from '@seaccentral/core/dist/topic/Topic.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import { CourseCategoryKey } from '@seaccentral/core/dist/course/CourseCategory.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { LearningTrackTag } from '@seaccentral/core/dist/learning-track/LearningTrackTag.entity';
import { LearningTrackTopic } from '@seaccentral/core/dist/learning-track/LearningTrackTopic.entity';
import { LearningTrackSection } from '@seaccentral/core/dist/learning-track/LearningTrackSection.entity';
import { LearningTrackMaterial } from '@seaccentral/core/dist/learning-track/LearningTrackMaterial.entity';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';
import { LearningTrackSectionCourse } from '@seaccentral/core/dist/learning-track/LearningTrackSectionCourse.entity';
import { CertificateUnlockRuleLearningTrackItem } from '@seaccentral/core/dist/certificate/CertificateUnlockRuleLearningTrackItem.entity';

import {
  CreateLearningTrackBody,
  UpdateLearningTrackBody,
} from './dto/learningTrack.dto';
import {
  LearningTrackSearchCategory,
  LearningTrackSearchQueryDto,
} from './dto/LearningTrackSearchQuery.dto';
import { LearningTrackSearchService } from './learningTrackSearch.service';
import { UserCourseProgressService } from '../course/userCourseProgress.service';

@Injectable()
export class LearningTrackService extends TransactionFor<LearningTrackService> {
  @Inject(forwardRef(() => LearningTrackSearchService))
  private learningTrackSearchService: LearningTrackSearchService;

  constructor(
    @InjectRepository(LearningTrack)
    private learningTrackRepository: Repository<LearningTrack>,
    @InjectRepository(LearningTrackTag)
    private learningTrackTagRepository: Repository<LearningTrackTag>,
    @InjectRepository(LearningTrackMaterial)
    private learningTrackMaterialRepository: Repository<LearningTrackMaterial>,
    @InjectRepository(LearningTrackTopic)
    private learningTrackTopicRepository: Repository<LearningTrackTopic>,
    @InjectRepository(LearningTrackSection)
    private learningTrackSectionRepository: Repository<LearningTrackSection>,
    @InjectRepository(LearningTrackSectionCourse)
    private learningTrackSectionCourseRepository: Repository<LearningTrackSectionCourse>,
    @InjectRepository(UserEnrolledLearningTrack)
    private userEnrolledLearningTrackRepository: Repository<UserEnrolledLearningTrack>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(Topic)
    private topicRepository: TreeRepository<Topic>,
    @InjectRepository(CertificateUnlockRuleLearningTrackItem)
    private certificateUnlockRuleLearningTrackItemRepository: Repository<CertificateUnlockRuleLearningTrackItem>,
    @InjectRepository(UserAssignedLearningTrack)
    private userAssignedLearningTrackRepository: Repository<UserAssignedLearningTrack>,
    moduleRef: ModuleRef,
    private userCourseProgressService: UserCourseProgressService,
  ) {
    super(moduleRef);
  }

  async create(learningTrackDto: CreateLearningTrackBody) {
    const learningTrackData: LearningTrack =
      this.learningTrackRepository.create({
        ...learningTrackDto,
        title: this.languageRepository.create(learningTrackDto.title),
        tagLine: learningTrackDto.tagLine
          ? this.languageRepository.create(learningTrackDto.tagLine)
          : undefined,
        description: learningTrackDto.description
          ? this.languageRepository.create(learningTrackDto.description)
          : undefined,
        learningObjective: learningTrackDto.learningObjective
          ? this.languageRepository.create(learningTrackDto.learningObjective)
          : undefined,
        learningTrackTarget: learningTrackDto.learningTrackTarget
          ? this.languageRepository.create(learningTrackDto.learningTrackTarget)
          : undefined,
        learningTrackTag: this.learningTrackTagRepository.create(
          learningTrackDto.tagIds.map((t) => ({ tag: { id: t } })),
        ),
        learningTrackMaterial: this.learningTrackMaterialRepository.create(
          learningTrackDto.materialIds.map((m) => ({ material: { id: m } })),
        ),
        learningTrackTopic: this.learningTrackTopicRepository.create(
          learningTrackDto.topicIds.map((t) => ({ topic: { id: t } })),
        ),
        category: { id: learningTrackDto.categoryId },
        learningTrackSection: this.learningTrackSectionRepository.create(
          learningTrackDto.learningTrackSections.map((lts) => ({
            part: lts.part,
            title: lts.title
              ? this.languageRepository.create(lts.title)
              : undefined,
            learningTrackSectionCourse:
              this.learningTrackSectionCourseRepository.create(
                lts.courses.map((c) => ({
                  course: { id: c.id },
                  isRequired: c.isRequired,
                })),
              ),
          })),
        ),
      });

    const learningTrack = await this.learningTrackRepository.save(
      learningTrackData,
    );

    this.updateSearchEntry(learningTrack, false);

    return learningTrack;
  }

  async update(id: string, learningTrackDto: UpdateLearningTrackBody) {
    const learningTrack = await this.learningTrackRepository.findOne(id, {
      relations: ['learningTrackSection'],
      where: { isActive: true },
    });

    if (!learningTrack) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Learning Track does not exist, id = "${id}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const courseIds = flatten(
      learningTrackDto.learningTrackSections.map((lts) =>
        lts.courses.map((c) => c.id),
      ),
    );

    if (this.hasDuplicates(courseIds)) {
      throw new HttpException(
        'Duplicate course in learning track section.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await Promise.all([
        this.learningTrackTagRepository.delete({ learningTrack }),
        this.learningTrackMaterialRepository.delete({ learningTrack }),
        this.learningTrackTopicRepository.delete({ learningTrack }),
        this.learningTrackSectionCourseRepository.delete({
          learningTrackSection: {
            id: In(
              learningTrackDto.learningTrackSections.map(
                (lts) => lts.id as string,
              ),
            ),
          },
        }),
      ]);

      const updatedLearningTrackDraft = this.learningTrackRepository.create({
        ...learningTrackDto,
        id,
        title: this.languageRepository.create(learningTrackDto.title),
        tagLine: learningTrackDto.tagLine
          ? this.languageRepository.create(learningTrackDto.tagLine)
          : undefined,
        description: learningTrackDto.description
          ? this.languageRepository.create(learningTrackDto.description)
          : undefined,
        learningObjective: learningTrackDto.learningObjective
          ? this.languageRepository.create(learningTrackDto.learningObjective)
          : undefined,
        learningTrackTarget: learningTrackDto.learningTrackTarget
          ? this.languageRepository.create(learningTrackDto.learningTrackTarget)
          : undefined,
        learningTrackTag: this.learningTrackTagRepository.create(
          learningTrackDto.tagIds.map((t) => ({ tag: { id: t } })),
        ),
        learningTrackMaterial: this.learningTrackMaterialRepository.create(
          learningTrackDto.materialIds.map((m) => ({ material: { id: m } })),
        ),
        learningTrackTopic: this.learningTrackTopicRepository.create(
          learningTrackDto.topicIds.map((t) => ({ topic: { id: t } })),
        ),
        category: { id: learningTrackDto.categoryId },
        learningTrackSection: this.learningTrackSectionRepository.create(
          learningTrackDto.learningTrackSections.map((lts) => ({
            id: lts.id,
            part: lts.part,
            title: lts.title
              ? this.languageRepository.create(lts.title)
              : undefined,
            learningTrackSectionCourse:
              this.learningTrackSectionCourseRepository.create(
                lts.courses.map((c) => ({
                  course: { id: c.id },
                  isRequired: c.isRequired,
                })),
              ),
          })),
        ),
      });

      const updatedLearningTrack = await this.learningTrackRepository.save(
        updatedLearningTrackDraft,
      );

      const certIds = await this.findLinkedCertificateIds([
        updatedLearningTrack.id,
      ]);

      if (certIds.length > 0) {
        await Promise.allSettled(
          certIds.map(async (certId) =>
            this.userCourseProgressService.evaluateUserCertificate(certId),
          ),
        );
      }

      return updatedLearningTrack;
    } catch (error) {
      if (error?.constraint === 'learning_track_section_course_unique') {
        throw new HttpException(
          'Duplicate course in learning track section.',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  async findAll(query: BaseQueryDto) {
    let learningTrackQuery = this.learningTrackRepository
      .createQueryBuilder('learningTrack')
      .leftJoinAndSelect('learningTrack.title', 'title')
      .leftJoinAndSelect('learningTrack.tagLine', 'tagLine')
      .leftJoinAndSelect('learningTrack.description', 'description')
      .leftJoinAndSelect('learningTrack.learningObjective', 'learningObjective')
      .leftJoinAndSelect(
        'learningTrack.learningTrackTarget',
        'learningTrackTarget',
      )
      .leftJoinAndSelect('learningTrack.category', 'category')
      .leftJoinAndSelect('learningTrack.learningTrackTag', 'learningTrackTag')
      .leftJoinAndSelect(
        'learningTrack.learningTrackTopic',
        'learningTrackTopic',
      )
      .leftJoinAndSelect(
        'learningTrackTag.tag',
        'tag',
        'tag.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackTopic.topic',
        'topic',
        'topic.isActive = :isActive',
      )
      .setParameters({ isActive: true })
      .where('learningTrack.isActive = true');

    if (query.searchField === 'topic' || query.searchField === 'tag') {
      learningTrackQuery = learningTrackQuery.andWhere(
        `${query.searchField}.name ILIKE :name`,
        {
          name: `%${query.search}%`,
        },
      );
    } else if (query.searchField === 'title') {
      learningTrackQuery.andWhere(
        '(title.nameEn ILIKE :name OR title.nameTh ILIKE :name)',
        {
          name: `%${query.search}%`,
        },
      );
    } else if (query.searchField !== '') {
      learningTrackQuery = learningTrackQuery.andWhere(
        new Brackets((qb) =>
          qb.where({
            [query.searchField]: ILike(`%${query.search}%`),
          }),
        ),
      );
    }

    const queryOrder = typeof query.order === 'string' ? query.order : 'DESC';
    if (query.orderBy === 'title') {
      learningTrackQuery = learningTrackQuery.orderBy(
        'title.nameEn',
        queryOrder,
      );
      learningTrackQuery = learningTrackQuery.addOrderBy(
        'title.nameTh',
        queryOrder,
      );
    } else {
      learningTrackQuery = learningTrackQuery.orderBy(
        `learningTrack.${query.orderBy}`,
        queryOrder,
      );
    }

    const count = await learningTrackQuery.getCount();
    const data = await learningTrackQuery
      .skip(query.skip)
      .take(query.take)
      .getMany();

    if (query.id && !data.some((lt) => lt.id === query.id)) {
      const specificLearningTrack = await learningTrackQuery
        .andWhere('learningTrack.id = :id', { id: query.id })
        .getOne();
      if (specificLearningTrack) {
        data.unshift(specificLearningTrack);
      }
    }

    return { data, count };
  }

  async findById(id: string) {
    const learningTrack = await this.learningTrackRepository
      .createQueryBuilder('lt')
      .leftJoinAndSelect('lt.title', 'title')
      .leftJoinAndSelect('lt.tagLine', 'tagLine')
      .leftJoinAndSelect('lt.description', 'description')
      .leftJoinAndSelect('lt.learningObjective', 'learningObjective')
      .leftJoinAndSelect('lt.learningTrackTarget', 'learningTrackTarget')
      .leftJoinAndSelect('lt.category', 'category')
      .leftJoinAndSelect(
        'lt.learningTrackSection',
        'learningTrackSection',
        'learningTrackSection.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackSection.title',
        'learningTrackSectionTitle',
      )
      .leftJoinAndSelect(
        'learningTrackSection.learningTrackSectionCourse',
        'learningTrackSectionCourse',
        'learningTrackSectionCourse.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackSectionCourse.course',
        'course',
        'course.isActive = :isActive AND course.status = :status',
      )
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect('lt.learningTrackTag', 'learningTrackTag')
      .leftJoinAndSelect('lt.learningTrackTopic', 'learningTrackTopic')
      .leftJoinAndSelect('lt.learningTrackMaterial', 'learningTrackMaterial')
      .leftJoinAndSelect(
        'learningTrackTag.tag',
        'tag',
        'tag.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackTopic.topic',
        'topic',
        'topic.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackMaterial.material',
        'material',
        'material.isActive = :isActive',
      )
      .setParameters({ isActive: true, status: CourseStatus.Published })
      .where('lt.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('lt.id = :learningTrackId', {
        learningTrackId: id,
      })
      .addOrderBy('learningTrackSection.part', 'ASC')
      .getOne();

    if (!learningTrack) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Learning track not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return learningTrack;
  }

  async findDetail(id: string, user: User) {
    const learningTrack = await this.learningTrackRepository
      .createQueryBuilder('lt')
      .leftJoinAndSelect('lt.title', 'title')
      .leftJoinAndSelect('lt.tagLine', 'tagLine')
      .leftJoinAndSelect('lt.description', 'description')
      .leftJoinAndSelect('lt.learningObjective', 'learningObjective')
      .leftJoinAndSelect('lt.learningTrackTarget', 'learningTrackTarget')
      .leftJoinAndSelect('lt.category', 'category')
      .leftJoinAndSelect(
        'lt.learningTrackSection',
        'learningTrackSection',
        'learningTrackSection.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackSection.title',
        'learningTrackSectionTitle',
      )
      .leftJoinAndSelect(
        'learningTrackSection.learningTrackSectionCourse',
        'learningTrackSectionCourse',
        'learningTrackSectionCourse.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackSectionCourse.course',
        'course',
        'course.isActive = :isActive AND course.status = :status',
      )
      .leftJoinAndSelect(
        'lt.userEnrolledLearningTrack',
        'userEnrolledLearningTrack',
        'userEnrolledLearningTrack.isActive = :isActive AND userEnrolledLearningTrack.userId = :userId',
      )
      .leftJoinAndSelect('course.title', 'courseTitle')
      .leftJoinAndSelect('course.tagLine', 'courseTagLine')
      .leftJoinAndSelect('course.category', 'courseCategory')
      .leftJoinAndSelect(
        'course.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
      )
      .leftJoinAndSelect('courseOutline.category', 'courseOutlineCategory')
      .leftJoinAndSelect(
        'course.userEnrolledCourse',
        'userEnrolledCourse',
        'userEnrolledCourse.isActive = :isActive AND userEnrolledCourse.userId = :userId',
      )
      .leftJoinAndSelect(
        'courseOutline.userCourseOutlineProgress',
        'userCourseOutlineProgress',
        'userCourseOutlineProgress.isActive = :isActive AND userCourseOutlineProgress.userId = :userId',
      )
      .leftJoinAndSelect('lt.learningTrackTag', 'learningTrackTag')
      .leftJoinAndSelect('lt.learningTrackTopic', 'learningTrackTopic')
      .leftJoinAndSelect('lt.learningTrackMaterial', 'learningTrackMaterial')
      .leftJoinAndSelect(
        'learningTrackTag.tag',
        'tag',
        'tag.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackTopic.topic',
        'topic',
        'topic.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'learningTrackMaterial.material',
        'material',
        'material.isActive = :isActive',
      )
      .leftJoinAndSelect(
        'lt.userAssignedLearningTrack',
        'userAssignedLearningTrack',
        'userAssignedLearningTrack.userId = :userId',
      )
      .where('lt.isActive = :isActive')
      .andWhere('lt.id = :learningTrackId')
      .setParameters({
        isActive: true,
        userId: user.id,
        learningTrackId: id,
        status: CourseStatus.Published,
      })
      .addOrderBy('learningTrackSection.part', 'ASC')
      .getOne();

    if (!learningTrack) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Learning track not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return learningTrack;
  }

  async enroll(learningTrackId: string, user: User) {
    const enrollStatus: {
      success: boolean;
    } = { success: true };

    const userEnrolledLearningTrack =
      await this.userEnrolledLearningTrackRepository.findOne({
        where: {
          learningTrack: { id: learningTrackId },
          user: { id: user.id },
        },
      });

    if (userEnrolledLearningTrack) {
      return enrollStatus;
    }

    await this.userEnrolledLearningTrackRepository.save({
      learningTrack: { id: learningTrackId },
      user,
    });

    return enrollStatus;
  }

  async search(
    query: LearningTrackSearchQueryDto,
    skip: number,
    take: number,
    user: User,
  ) {
    const certificateDict: { [key: string]: boolean } = {};
    let topicFilter: Topic[] = [];
    const filterIds = [];

    if (query.topicId) {
      const topic = await this.topicRepository.findOne(query.topicId);
      if (!topic) {
        return {
          data: [],
          certificateDict,
          count: 0,
        };
      }
      const tDes = await this.topicRepository.findDescendants(topic);
      topicFilter = tDes.length > 0 ? tDes : [topic];
    }

    if (query.assignmentType) {
      const userAssignedLearningTracks =
        await this.userAssignedLearningTrackRepository.find({
          where: { userId: user.id, assignmentType: query.assignmentType },
        });

      if (userAssignedLearningTracks.length < 1) {
        return {
          data: [],
          certificateDict,
          count: 0,
        };
      }

      filterIds.push(
        ...userAssignedLearningTracks.map((ualt) => ualt.learningTrackId),
      );
    }

    const { total, data: searchResult } =
      await this.learningTrackSearchService.search({
        topicIds: topicFilter.map((item) => item.id).join(' '),
        privateLearningTrackIds: [],
        categoryKeys:
          query.category === LearningTrackSearchCategory.ONLINE_ONLY
            ? [CourseCategoryKey.ONLINE_LEARNING]
            : [],
        from: skip,
        size: take,
        hasCertificate: query.hasCertificate,
        filterIds,
      });

    const ids: string[] = [];
    searchResult.forEach((sr) => {
      certificateDict[sr.id] = sr.hasCertificate;
      ids.push(sr.id);
    });

    if (!ids.length) {
      return {
        data: [],
        certificateDict,
        count: 0,
      };
    }

    const data = await this.learningTrackRepository
      .createQueryBuilder('lt')
      .leftJoinAndSelect('lt.title', 'title')
      .leftJoinAndSelect('lt.tagLine', 'tagLine')
      .leftJoinAndSelect('lt.description', 'description')
      .leftJoinAndSelect('lt.learningObjective', 'learningObjective')
      .leftJoinAndSelect('lt.learningTrackTarget', 'learningTrackTarget')
      .leftJoinAndSelect('lt.category', 'category')
      .leftJoinAndSelect(
        'lt.userAssignedLearningTrack',
        'userAssignedLearningTrack',
        'userAssignedLearningTrack.userId = :userId',
      )
      .where('lt.isActive = :isActive')
      .andWhere('lt.id IN (:...learningTrackIds)')
      .setParameters({
        isActive: true,
        userId: user.id,
        learningTrackIds: ids,
      })
      .addOrderBy('lt.isFeatured', 'DESC')
      .addOrderBy('lt.createdAt', 'DESC')
      .getMany();

    return {
      data,
      certificateDict,
      count: total,
    };
  }

  async deleteLanguageFromLearningTracks(ids: string[]) {
    const learningTracks = await this.learningTrackRepository.find({
      where: { id: In(ids) },
      relations: ['learningTrackSection'],
    });
    const learningTrackPromises = learningTracks.map(async (lt) => {
      const promises = [];
      if (lt.title) promises.push(this.languageRepository.remove(lt.title));
      if (lt.tagLine) promises.push(this.languageRepository.remove(lt.tagLine));
      if (lt.description)
        promises.push(this.languageRepository.remove(lt.description));
      if (lt.learningObjective)
        promises.push(this.languageRepository.remove(lt.learningObjective));
      if (lt.learningTrackTarget)
        promises.push(this.languageRepository.remove(lt.learningTrackTarget));
      lt.learningTrackSection?.forEach(async (lts) => {
        if (lts.title) promises.push(this.languageRepository.remove(lts.title));
      });
      await Promise.all(promises);

      return this.learningTrackRepository.save(lt);
    });

    await Promise.all(learningTrackPromises);
  }

  async delete(id: string) {
    await this.deleteLanguageFromLearningTracks([id]);
    await this.learningTrackRepository.delete({ id });
  }

  async deleteMany(ids: string[]) {
    await this.deleteLanguageFromLearningTracks(ids);
    await this.learningTrackRepository.delete({ id: In(ids) });
  }

  async updateSearchEntry(learningTrack: LearningTrack, isNew: boolean) {
    if (learningTrack && learningTrack.status === CourseStatus.Published) {
      const learningTrackWithDetail = await this.findById(learningTrack.id);

      this.learningTrackSearchService.indexLearningTrack(
        learningTrackWithDetail,
      );
    } else if (!isNew) {
      this.learningTrackSearchService.removeIndex(learningTrack.id);
    }
  }

  private hasDuplicates(arr: string[]) {
    const uniqueSet = new Set(arr);
    return arr.length !== uniqueSet.size;
  }

  async getCertificateMap(originalIds: string[]) {
    const chunkSize = 1000;
    const chunkIds = chunk(originalIds, chunkSize);

    const resultMap = new Map<string, boolean>();

    const promises = chunkIds.map((learningTrackIds) => {
      return this.certificateUnlockRuleLearningTrackItemRepository
        .createQueryBuilder('item')
        .andWhere('item.learningTrackId IN(:...learningTrackIds)')
        .select('item.learningTrackId', 'learning_track_id')
        .addSelect('COUNT(item.learningTrackId) > 0', 'has_certificate')
        .groupBy('item.learningTrackId')
        .setParameters({ learningTrackIds })
        .getRawMany<{ learning_track_id: string; has_certificate: boolean }>();
    });

    const rawResult = await Promise.all(promises);
    const flattenResult = flatten(rawResult);
    flattenResult.forEach((result) => {
      resultMap.set(result.learning_track_id, result.has_certificate);
    });

    return resultMap;
  }

  async checkLearningTracksHaveLinkedCertificate(
    learningTrackIds: string[],
  ): Promise<Record<string, boolean>> {
    const dict: { [key: string]: boolean } = {};
    if (!learningTrackIds.length) return dict;

    const items = await this.certificateUnlockRuleLearningTrackItemRepository
      .createQueryBuilder('lturi')
      .select('lturi.learningTrackId')
      .where('lturi.isActive = :isActive')
      .andWhere('lturi.learningTrackId IN(:...learningTrackIds)')
      .setParameters({
        isActive: true,
        learningTrackIds,
      })
      .getMany();

    learningTrackIds.forEach((id) => {
      dict[id] = items.some((it) => it.learningTrackId === id);
    });
    return dict;
  }

  async findLinkedCertificateIds(
    learningTrackIds: string[],
  ): Promise<string[]> {
    const raw = await this.certificateUnlockRuleLearningTrackItemRepository
      .createQueryBuilder('lturi')
      .innerJoin('lturi.unlockRule', 'unlockRule')
      .select('unlockRule.certificateId', 'id')
      .where('lturi.learningTrackId IN(:...learningTrackIds)', {
        learningTrackIds,
      })
      .andWhere('lturi.isActive = :isActive', { isActive: true })
      .getRawMany<{ id: string }>();

    return raw.map((x) => x.id);
  }
}
