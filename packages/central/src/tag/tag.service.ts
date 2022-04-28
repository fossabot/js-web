import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '@seaccentral/core/dist/tag/Tag.entity';
import { TagType } from '@seaccentral/core/dist/tag/TagType.enum';
import { CourseTag } from '@seaccentral/core/dist/course/CourseTag.entity';
import { sluggerFilter } from '@seaccentral/core/dist/utils/string';
import { IListParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { In, Like, Not, Repository } from 'typeorm';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { TagBody } from './dto/TagBody.dto';
import { IArchivedTagFilters } from './interface/IArchivedTagFilters';
import { ITagListFilter } from './interface/ITagListFilter';

interface IParams extends IListParams {
  type?: TagType;
}

@Injectable()
export class TagService extends TransactionFor {
  constructor(
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(CourseTag)
    private courseTagRepository: Repository<CourseTag>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async findAll(query: IParams) {
    const where: ITagListFilter = {
      isActive: true,
      type: query.type || TagType.COURSE,
    };

    if (query.search && query.searchField) {
      where[query.searchField] = Like(`%${query.search}%`);
    }

    const count = await this.tagRepository.count(where);

    const tags = await this.tagRepository.find({
      skip: query.skip,
      take: query.take,
      order: {
        [query.orderBy]: query.order,
      },
      where,
    });

    return { tags, count };
  }

  async findById(id: string) {
    const tag = await this.tagRepository.findOne({ id, isActive: true });
    if (!tag) throw new HttpException('Tag not found.', HttpStatus.NOT_FOUND);

    return tag;
  }

  async create(body: TagBody) {
    let tag = await this.getArchivedTag(body);

    if (!tag) {
      tag = this.tagRepository.create({
        name: sluggerFilter(body.name),
        type: body.type,
      });
    }

    tag.name = sluggerFilter(body.name);
    tag.type = body.type;
    tag.isActive = true;

    await this.tagRepository.save(tag);
    return tag;
  }

  async update(id: string, body: TagBody) {
    let tag = await this.getArchivedTag(body, id);

    if (!tag) {
      tag = await this.findById(id);
    }

    tag.name = sluggerFilter(body.name);
    tag.type = body.type;
    tag.isActive = true;

    await this.tagRepository.save(tag);

    return tag;
  }

  async deleteMany(ids: string[]) {
    await this.courseTagRepository.delete({ tag: { id: In(ids) } });
    await this.tagRepository.update({ id: In(ids) }, { isActive: false });
  }

  private async getArchivedTag(
    body: { name: string; type: TagType },
    skipId?: string,
  ) {
    const where: IArchivedTagFilters = {
      name: body.name,
      type: body.type || TagType.COURSE,
    };
    if (skipId) {
      where.id = Not(skipId);
    }
    const tag = await this.tagRepository.findOne({ where });
    if (tag && tag.isActive)
      throw new HttpException(
        'This tag name is already exist.',
        HttpStatus.BAD_REQUEST,
      );

    return tag;
  }
}
