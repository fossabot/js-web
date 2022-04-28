import { add } from 'date-fns';
import { Brackets, ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { IListParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { CourseRule } from '@seaccentral/core/dist/course/CourseRule.entity';
import { CourseRuleItem } from '@seaccentral/core/dist/course/CourseRuleItem.entity';

import {
  CreateCourseRuleBody,
  GetCourseRuleByCourseOutlineQueryDto,
  UpdateCourseRuleBody,
} from './dto/CourseRule.dto';

@Injectable()
export class CourseRuleService {
  constructor(
    @InjectRepository(CourseRule)
    private courseRuleRepository: Repository<CourseRule>,
    @InjectRepository(CourseRuleItem)
    private courseRuleItemRepository: Repository<CourseRuleItem>,
  ) {}

  async findAll(query: IListParams) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const result = await this.courseRuleRepository.findAndCount({
      where: {
        ...searchField,
        isActive: true,
      },
      take: query.take,
      skip: query.skip,
      order: {
        ...orderByField,
      },
      relations: [
        'createdBy',
        'lastModifiedBy',
        'courseRuleItem',
        'courseRuleItem.appliedFor',
        'courseRuleItem.appliedBy',
      ],
    });

    return result;
  }

  async findById(id: string) {
    const courseRule = await this.courseRuleRepository
      .createQueryBuilder('courseRule')
      .leftJoinAndSelect('courseRule.createdBy', 'createdBy')
      .leftJoinAndSelect('courseRule.lastModifiedBy', 'lastModifiedBy')
      .leftJoinAndSelect('courseRule.courseRuleItem', 'courseRuleItem')
      .leftJoinAndSelect('courseRuleItem.appliedFor', 'appliedFor')
      .leftJoinAndSelect('courseRuleItem.appliedBy', 'appliedBy')
      .where('courseRule.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('courseRule.id = :courseRuleId', {
        courseRuleId: id,
      })
      .addOrderBy('courseRuleItem.createdAt', 'ASC')
      .getOne();

    if (!courseRule) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Course rule not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return courseRule;
  }

  async findByCourseOutline(params: GetCourseRuleByCourseOutlineQueryDto) {
    const courseRules = await this.courseRuleRepository
      .createQueryBuilder('courseRule')
      .leftJoinAndSelect('courseRule.courseRuleItem', 'courseRuleItem')
      .leftJoinAndSelect('courseRuleItem.appliedFor', 'appliedFor')
      .leftJoinAndSelect('courseRuleItem.appliedBy', 'appliedBy')
      .where('courseRuleItem.type IN (:...types)', {
        types: params.types,
      })
      .andWhere('courseRule.isActive = :isActive', {
        isActive: true,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('appliedBy.id IN (:...courseOutlineIds)', {
            courseOutlineIds: params.ids,
          });
          qb.orWhere('appliedFor.id IN (:...courseOutlineIds)', {
            courseOutlineIds: params.ids,
          });
        }),
      )
      .getMany();

    return courseRules;
  }

  async create(courseRuleBody: CreateCourseRuleBody, user: User) {
    const courseRuleData = this.courseRuleRepository.create({
      ...courseRuleBody,
      createdBy: user,
      lastModifiedBy: user,
      courseRuleItem: courseRuleBody.courseRuleItems.map((cri, idx) =>
        this.courseRuleItemRepository.create({
          ...cri,
          createdAt: add(new Date(), { seconds: idx }),
          appliedFor: { id: cri.appliedForId },
          appliedBy: { id: cri.appliedById },
        }),
      ),
    });

    const courseRule = await this.courseRuleRepository.save(courseRuleData);

    return courseRule;
  }

  async update(id: string, courseRuleBody: UpdateCourseRuleBody, user: User) {
    const courseRule = await this.courseRuleRepository.findOne(id, {
      where: { isActive: true },
    });

    if (!courseRule) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Course rule does not exist, id = "${id}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const courseRuleUpdateData = this.courseRuleRepository.create({
      ...courseRuleBody,
      id,
      lastModifiedBy: user,
      courseRuleItem: courseRuleBody.courseRuleItems.map((cri, idx) =>
        this.courseRuleItemRepository.create({
          ...cri,
          createdAt: add(new Date(), { seconds: idx }),
          id: cri.id,
          appliedFor: { id: cri.appliedForId },
          appliedBy: { id: cri.appliedById },
        }),
      ),
    });

    const updatedCourseRule = await this.courseRuleRepository.save(
      courseRuleUpdateData,
    );

    return updatedCourseRule;
  }

  async deleteMany(ids: string[]) {
    const courseRules = await this.courseRuleRepository.find({
      where: { id: In(ids) },
      relations: ['courseRuleItem'],
    });

    if (courseRules.length < 1) {
      throw new HttpException('Course Rule not found', HttpStatus.NOT_FOUND);
    }

    await this.courseRuleRepository.save(
      courseRules.map((cr) => ({
        ...cr,
        isActive: false,
        courseRuleItem: cr.courseRuleItem.map((cri) => ({
          ...cri,
          isActive: false,
        })),
      })),
    );
  }
}
