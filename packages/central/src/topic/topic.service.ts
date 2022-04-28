import { ModuleRef } from '@nestjs/core';
import { In, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Topic } from '@seaccentral/core/dist/topic/Topic.entity';
import { IListParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { getEntityMetadata } from '@seaccentral/core/dist/utils/entityHelpers';
import { CourseTopic } from '@seaccentral/core/dist/course/CourseTopic.entity';

import { TopicBody } from './dto/TopicBody';

@Injectable()
export class TopicService extends TransactionFor<Topic> {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: TreeRepository<Topic>,
    @InjectRepository(CourseTopic)
    private courseTopicRepository: TreeRepository<CourseTopic>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async findAll(query: IListParams) {
    const qb = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.parent', 'parent')
      .where({ isActive: true })
      .orderBy(`topic.${query.orderBy}`, query.order);

    if (query.search && query.searchField) {
      qb.andWhere(`topic.${query.searchField} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }
    const count = await qb.getCount();
    const topics = await qb.skip(query.skip).take(query.take).getMany();

    return { topics, count };
  }

  async findTree() {
    const topics = await this.topicRepository.findTrees();
    return this.recursiveRemoveInactive(topics);
  }

  /**
   * Return only active topics.
   * @param topics Raw topics array.
   * @returns Active topics.
   */
  private recursiveRemoveInactive(topics: Topic[]) {
    topics = [...topics.filter((topic) => topic.isActive)];
    topics.forEach((topic) => {
      if (topic.children && topic.children.length) {
        topic.children = this.recursiveRemoveInactive(topic.children);
      }
    });
    return topics;
  }

  async findById(id: string, key = '') {
    const topic = await this.topicRepository.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: ['parent'],
    });
    if (!topic)
      throw new HttpException('Course Topic not found.', HttpStatus.NOT_FOUND);

    if (key === 'subtopics') {
      const topicTree = await this.topicRepository.findDescendantsTree(topic);
      if (topicTree && topicTree.children) {
        const children = topicTree.children
          ?.filter((item) => item.id !== topic.id)
          .map((item) => {
            delete item.children;
            return item;
          });
        topic.children = children;
      }
    }

    return topic;
  }

  async create(body: TopicBody) {
    await this.checkExist(body.name);

    const topic = this.topicRepository.create();

    topic.name = body.name;
    topic.description = body.description || null;
    topic.parent = body.parentId
      ? await this.topicRepository.findOne(body.parentId)
      : undefined;
    topic.isActive = true;

    await this.topicRepository.save(topic);
    return topic;
  }

  async update(id: string, body: TopicBody) {
    await this.checkExist(body.name, id);

    const topic = await this.findById(id);

    topic.name = body.name;
    topic.description = body.description || null;

    await this.topicRepository.save(topic);

    return topic;
  }

  async checkLinkedCourse(ids: string[]) {
    const topics = await this.courseTopicRepository
      .createQueryBuilder('courseTopic')
      .innerJoinAndSelect('courseTopic.topic', 'topic')
      .where('courseTopic.topicId IN(:...ids)', { ids })
      .select('topic.name', 'name')
      .distinct(true)
      .getRawMany();
    return topics && topics.length;
  }

  async deleteMany(ids: string[]) {
    const topics = await this.topicRepository.find({ id: In(ids) });

    if (!topics || topics.length < 1) {
      throw new HttpException('Topic not found', HttpStatus.NOT_FOUND);
    }

    const promises = topics.map(async (topic) => {
      const { id } = topic;

      const {
        tableName,
        primaryColumn,
        parentPropertyName,
        closureTableName,
        ancestorColumn,
        descendantColumn,
      } = getEntityMetadata<Topic>(this.topicRepository);

      // Get all the descendant node ids from the closure table
      const closureNodes = await this.topicRepository
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
        const hasLinked = await this.checkLinkedCourse(descendantNodeIds);
        if (hasLinked) {
          throw new HttpException(
            `Can't delete "${topic.name}", because it (or its sub-topic) is linked to the course(s).`,
            HttpStatus.CONFLICT,
          );
        }

        // Delete all the nodes from the closure table
        await this.topicRepository
          .createQueryBuilder()
          .delete()
          .from(closureTableName)
          .where(`${descendantColumn} IN (:...ids)`, { ids: descendantNodeIds })
          .execute();

        // Set parent FK to null in the main table
        await this.topicRepository
          .createQueryBuilder()
          .update(tableName, { [parentPropertyName]: null })
          .where(`${parentPropertyName} IN (:...ids)`, {
            ids: descendantNodeIds,
          })
          .execute();

        // Delete from main table
        await this.topicRepository
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
    const query = this.topicRepository
      .createQueryBuilder('topic')
      .where('topic.name = :name AND topic.isActive = :isActive', {
        name,
        isActive: true,
      });

    if (skipId) {
      query.andWhere('topic.id != :skipId', { skipId });
    }

    const count = await query.getCount();

    if (count > 0)
      throw new HttpException(
        'Topic name already exist.',
        HttpStatus.BAD_REQUEST,
      );
  }
}
