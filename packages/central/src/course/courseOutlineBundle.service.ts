import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseOutlineBundle } from '@seaccentral/core/dist/course/CourseOutlineBundle.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ILike, Repository } from 'typeorm';
import { CreateCourseOutlineBundle } from './dto/CourseOutlineBundle.dto';

@Injectable()
export class CourseOutlineBundleService extends TransactionFor<CourseOutlineBundleService> {
  constructor(
    @InjectRepository(CourseOutlineBundle)
    private courseOutlineBundleRepository: Repository<CourseOutlineBundle>,
    private configService: ConfigService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async createCourseOutlineBundle(body: CreateCourseOutlineBundle) {
    const { name, courseOutlineIds } = body;

    return this.courseOutlineBundleRepository.save({
      name,
      courseOutline: courseOutlineIds.map((id: string) => ({
        id,
      })),
    });
  }

  async getAllCourseOutlineBundle(
    query: BaseQueryDto,
  ): Promise<
    [
      Omit<
        CourseOutlineBundle,
        'courseOutline' & { courseOutline: { id: string }[] }
      >[],
      number,
    ]
  > {
    const searchField = query.searchField && {
      [query.searchField]: ILike(`%${query.search}%`),
    };
    const orderByField = query.orderBy && { [query.orderBy]: query.order };

    return this.courseOutlineBundleRepository.findAndCount({
      where: {
        ...searchField,
      },
      take: query.take,
      skip: query.skip,
      order: {
        ...orderByField,
      },
    });
  }

  async getCourseOutlineBundleById(id: string) {
    const courseOutlineBundle =
      await this.courseOutlineBundleRepository.findOne({
        where: { id },
        relations: ['courseOutline'],
      });

    if (!courseOutlineBundle)
      throw new NotFoundException('Course outline bundle id not found');

    return courseOutlineBundle;
  }

  async updateCourseOutlineBundleId(
    id: string,
    body: CreateCourseOutlineBundle,
  ) {
    const { name, courseOutlineIds, isActive } = body;

    return this.courseOutlineBundleRepository.save({
      id,
      name,
      isActive,
      courseOutline: courseOutlineIds.map((outlineId: string) => ({
        id: outlineId,
      })),
    });
  }

  async deleteCourseOutlineBundleId(id: string) {
    await this.courseOutlineBundleRepository.delete({ id });
  }
}
