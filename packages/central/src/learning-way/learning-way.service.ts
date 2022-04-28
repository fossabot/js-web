import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningWay } from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import { CourseOutline } from '@seaccentral/core/dist/course/CourseOutline.entity';
import { IListParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { In, TreeRepository } from 'typeorm';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { getEntityMetadata } from '@seaccentral/core/dist/utils/entityHelpers';
import { LearningWayBody } from './dto/LearningWayBody';

@Injectable()
export class LearningWayService extends TransactionFor<LearningWay> {
  constructor(
    @InjectRepository(LearningWay)
    private learningWayRepository: TreeRepository<LearningWay>,
    @InjectRepository(CourseOutline)
    private courseOutlineRepository: TreeRepository<CourseOutline>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async findAll(query: IListParams) {
    const qb = await this.learningWayRepository
      .createQueryBuilder('learning_way')
      .leftJoinAndSelect('learning_way.parent', 'parent')
      .where({ isActive: true })
      .orderBy(`learning_way.${query.orderBy}`, query.order);

    if (query.search && query.searchField) {
      qb.andWhere(`learning_way.${query.searchField} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }
    const count = await qb.getCount();
    const learningWays = await qb.skip(query.skip).take(query.take).getMany();

    return { learningWays, count };
  }

  async findTree() {
    const learningWays = await this.learningWayRepository.findTrees();
    return this.recursiveRemoveInactive(learningWays);
  }

  private recursiveRemoveInactive(learningWays: LearningWay[]) {
    learningWays = [
      ...learningWays.filter((learningWay) => learningWay.isActive),
    ];
    learningWays.forEach((learningWay) => {
      if (learningWay.children && learningWay.children.length) {
        learningWay.children = this.recursiveRemoveInactive(
          learningWay.children,
        );
      }
    });
    return learningWays;
  }

  async findById(id: string, key = '') {
    const learningWay = await this.learningWayRepository.findOne({
      id,
      isActive: true,
    });
    if (!learningWay)
      throw new HttpException('Learning way not found.', HttpStatus.NOT_FOUND);
    if (key === 'sublearningways') {
      const learningTree = await this.learningWayRepository.findDescendantsTree(
        learningWay,
      );
      if (learningTree && learningTree.children) {
        const children = learningTree.children
          ?.filter((item) => item.id !== learningWay.id)
          .map((item) => {
            delete item.children;
            return item;
          });
        learningWay.children = children;
      }
    }

    return learningWay;
  }

  async create(body: LearningWayBody) {
    await this.checkExist(body.name);

    const learningWay = this.learningWayRepository.create();

    learningWay.name = body.name;
    learningWay.description = body.description || null;
    learningWay.parent = body.parentId
      ? await this.learningWayRepository.findOne(body.parentId)
      : undefined;
    learningWay.isActive = true;

    await this.learningWayRepository.save(learningWay);
    return learningWay;
  }

  async update(id: string, body: LearningWayBody) {
    await this.checkExist(body.name, id);

    const learningWay = await this.findById(id);

    if (!learningWay.key) {
      learningWay.name = body.name;
    }
    learningWay.description = body.description || null;

    await this.learningWayRepository.save(learningWay);

    return learningWay;
  }

  async checkLinkedCourseOutlines(ids: string[]) {
    const rows = await this.courseOutlineRepository
      .createQueryBuilder('courseOutline')
      .innerJoinAndSelect('courseOutline.learningWay', 'learningWay')
      .innerJoinAndSelect('courseOutline.course', 'course')
      .where('courseOutline.learningWayId IN(:...ids)', { ids })
      .select(['learningWay.name AS wayname', 'course.title AS coursename'])
      .distinct(true)
      .getRawMany();
    if (rows?.length) {
      const errors = rows.map(
        (row) =>
          `Can't delete "${row.wayname}", because it's linked to some course ${row.coursename}.`,
      );
      throw new HttpException(errors, HttpStatus.FORBIDDEN);
    }
  }

  async deleteMany(ids: string[]) {
    const learningWays = await this.learningWayRepository.find({ id: In(ids) });

    if (!learningWays || learningWays.length < 1) {
      throw new HttpException('Learning way not found', HttpStatus.NOT_FOUND);
    }

    if (learningWays.some((it) => it.key)) {
      throw new HttpException(
        "Can't delete top level way of learning.",
        HttpStatus.FORBIDDEN,
      );
    }

    const promises = learningWays.map(async (learningWay) => {
      const { id } = learningWay;
      const {
        tableName,
        primaryColumn,
        parentPropertyName,
        closureTableName,
        ancestorColumn,
        descendantColumn,
      } = getEntityMetadata<LearningWay>(this.learningWayRepository);

      // Get all the descendant node ids from the closure table
      const closureNodes = await this.learningWayRepository
        .createQueryBuilder()
        .select(`closure.${descendantColumn}`)
        .distinct(true)
        .from(closureTableName, 'closure')
        .where(`closure.${ancestorColumn} = :ancestorId`, { ancestorId: id })
        .getRawMany();

      const descendantNodeIds = closureNodes.map(
        (v) => v[`closure_${descendantColumn}`],
      );

      if (descendantNodeIds && descendantNodeIds.length) {
        await this.checkLinkedCourseOutlines(descendantNodeIds);

        // Delete all the nodes from the closure table
        await this.learningWayRepository
          .createQueryBuilder()
          .delete()
          .from(closureTableName)
          .where(`${descendantColumn} IN (:...ids)`, { ids: descendantNodeIds })
          .execute();

        // Set parent FK to null in the main table
        await this.learningWayRepository
          .createQueryBuilder()
          .update(tableName, { [parentPropertyName]: null })
          .where(`${parentPropertyName} IN (:...ids)`, {
            ids: descendantNodeIds,
          })
          .execute();

        // Delete from main table
        await this.learningWayRepository
          .createQueryBuilder()
          .delete()
          .from(tableName)
          .where(`${primaryColumn} IN (:...ids)`, { ids: descendantNodeIds })
          .execute();
      }
    });

    await Promise.all(promises);
  }

  private async checkExist(name: string, skipId?: string) {
    const query = this.learningWayRepository
      .createQueryBuilder('learning_way')
      .where(
        'learning_way.name = :name AND learning_way.isActive = :isActive',
        {
          name,
          isActive: true,
        },
      );

    if (skipId) {
      query.andWhere('learning_way.id != :skipId', { skipId });
    }

    const count = await query.getCount();

    if (count > 0)
      throw new HttpException(
        'Learning way name already exist.',
        HttpStatus.BAD_REQUEST,
      );
  }
}
