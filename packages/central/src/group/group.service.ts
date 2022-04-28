import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, TreeRepository } from 'typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { getEntityMetadata } from '@seaccentral/core/dist/utils/entityHelpers';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';

import { CreateGroupBody } from './dto/CreateGroupBody.dto';
import { UpdateGroupBody } from './dto/UpdateGroupBody.dto';

@Injectable()
export class GroupService extends TransactionFor<GroupService> {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    @InjectRepository(Group)
    private groupRepository: TreeRepository<Group>,
    @InjectRepository(Group)
    private groupNonTreeRepository: Repository<Group>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly redisCacheService: RedisCacheService,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async list() {
    const groups = await this.groupRepository.findRoots();

    return groups;
  }

  async search(query: BaseQueryDto) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const count = await this.groupNonTreeRepository.count(searchField);
    const groups = await this.groupNonTreeRepository.find({
      where: {
        ...searchField,
      },
      skip: query.skip,
      take: query.take,
      order: {
        ...orderByField,
      },
    });

    if (query.id && !groups.some((group) => group.id === query.id)) {
      const specificGroup = await this.groupNonTreeRepository.findOne({
        id: query.id,
      });
      if (specificGroup) {
        groups.unshift(specificGroup);
      }
    }

    return { groups, count };
  }

  async listNodes() {
    const groups = await this.groupRepository.find();

    return groups;
  }

  async findDescendant(id: string) {
    const cachedDescendant = await this.redisCacheService.get<Group[]>(
      cacheKeys.GROUP.DESCENDANT_BY_GROUP_ID.replace('id', id),
    );

    if (cachedDescendant) return cachedDescendant;

    const group = await this.groupRepository.findOne(id);

    if (!group) {
      throw new HttpException('Cannot find group.', HttpStatus.NOT_FOUND);
    }

    const groupDescendant = await this.groupRepository.findDescendantsTree(
      group,
    );

    this.redisCacheService
      .set<Group[]>(
        cacheKeys.GROUP.DESCENDANT_BY_GROUP_ID.replace('id', id),
        groupDescendant.children,
        { ttl: 60 },
      )
      .catch((err) =>
        this.logger.error('Error caching DESCENDANT_BY_GROUP_ID', err),
      );

    return groupDescendant.children;
  }

  async create(body: CreateGroupBody) {
    const newGroup = this.groupRepository.create({ name: body.name });

    if (body.parentId) {
      const parentGroup = await this.groupRepository.findOne(body.parentId);

      if (!parentGroup) {
        throw new HttpException('Invalid parent id.', HttpStatus.BAD_REQUEST);
      }

      this.redisCacheService
        .del(
          cacheKeys.GROUP.DESCENDANT_BY_GROUP_ID.replace('id', body.parentId),
        )
        .catch((err) =>
          this.logger.error('Error caching DESCENDANT_BY_GROUP_ID', err),
        );
      newGroup.parent = parentGroup;
    }

    await this.groupRepository.save(newGroup);
    this.redisCacheService
      .del(cacheKeys.GROUP.ALL)
      .catch((err) => this.logger.error('Error caching GROUP.ALL', err));

    return newGroup;
  }

  async addUser(groupId: string, userId: string) {
    const group = await this.groupRepository.findOne(groupId);
    const user = await this.userRepository.findOne(userId);

    if (!group || !user) {
      throw new HttpException(
        'Cannot find group or user.',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const groupUser = await this.groupUserRepository.save({ group, user });

      return groupUser;
    } catch (error) {
      if (error.constraint === 'group_user_unique') {
        throw new HttpException(
          'User with this group id already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  async getUsers(groupId: string) {
    const group = await this.groupRepository.findOne(groupId);

    if (!group) {
      throw new HttpException('Cannot find group.', HttpStatus.NOT_FOUND);
    }

    const groupUsers = await this.groupUserRepository.find({
      relations: ['user'],
      where: {
        group: { id: groupId },
      },
    });

    return groupUsers;
  }

  async getDescendantUsers(groupId: string) {
    const group = await this.groupRepository.findOne(groupId);

    if (!group) {
      throw new HttpException('Cannot find group.', HttpStatus.NOT_FOUND);
    }

    const descendants = await this.groupRepository.findDescendants(group);

    if (
      !descendants ||
      !descendants.length ||
      (descendants.length === 1 && descendants[0].id === groupId)
    ) {
      throw new HttpException(
        'Cannot find group descendants.',
        HttpStatus.NOT_FOUND,
      );
    }

    const groupUsers = await this.groupUserRepository
      .createQueryBuilder('groupUser')
      .innerJoinAndSelect('groupUser.group', 'group')
      .innerJoinAndSelect('groupUser.user', 'user')
      .where('"groupUser"."groupId" IN (:...ids)', {
        ids: descendants.filter((d) => d.id !== group.id).map((d) => d.id),
      })
      .getMany();

    return groupUsers;
  }

  async deleteUser(body: UserIdentifiers) {
    const groupUser = await this.groupUserRepository.findByIds(body.ids);

    if (!groupUser || !groupUser.length) {
      throw new HttpException('Cannot find group user.', HttpStatus.NOT_FOUND);
    }

    await this.groupUserRepository.delete(body.ids);
  }

  async delete(id: string) {
    const group = await this.groupRepository.findOne(id);

    if (!group) {
      throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
    }

    const {
      tableName,
      primaryColumn,
      parentPropertyName,
      closureTableName,
      ancestorColumn,
      descendantColumn,
    } = getEntityMetadata<Group>(this.groupRepository);

    // Get all the descendant node ids from the closure table
    const closureNodes = await this.groupRepository
      .createQueryBuilder()
      .select(`closure.${descendantColumn}`)
      .distinct(true)
      .from(closureTableName, 'closure')
      .where(`closure.${ancestorColumn} = :ancestorId`, { ancestorId: id })
      .getRawMany();

    const descendantNodeIds = closureNodes.map(
      (v) => v[`closure_${descendantColumn}`],
    );

    // Delete all the nodes from the closure table
    await this.groupRepository
      .createQueryBuilder()
      .delete()
      .from(closureTableName)
      .where(`${descendantColumn} IN (:...ids)`, { ids: descendantNodeIds })
      .execute();

    // Set parent FK to null in the main table
    await this.groupRepository
      .createQueryBuilder()
      .update(tableName, { [parentPropertyName]: null })
      .where(`${parentPropertyName} IN (:...ids)`, { ids: descendantNodeIds })
      .execute();

    // Delete from main table
    await this.groupRepository
      .createQueryBuilder()
      .delete()
      .from(tableName)
      .where(`${primaryColumn} IN (:...ids)`, { ids: descendantNodeIds })
      .execute();

    if (group?.parentId) {
      this.redisCacheService
        .del(
          cacheKeys.GROUP.DESCENDANT_BY_GROUP_ID.replace('id', group.parentId),
        )
        .catch((err) =>
          this.logger.error('Error caching DESCENDANT_BY_GROUP_ID', err),
        );
    }
    this.redisCacheService
      .del(cacheKeys.GROUP.DESCENDANT_BY_GROUP_ID.replace('id', id))
      .catch((err) =>
        this.logger.error('Error caching DESCENDANT_BY_GROUP_ID', err),
      );
    this.redisCacheService
      .del(cacheKeys.GROUP.ALL)
      .catch((err) => this.logger.error('Error caching GROUP.ALL', err));
  }

  async update(id: Group['id'], dto: UpdateGroupBody) {
    const group = await this.groupRepository.findOne(id);

    if (!group) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Group not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.groupRepository.save({
      id,
      ...dto,
    });

    if (group.parentId) {
      this.redisCacheService
        .del(
          cacheKeys.GROUP.DESCENDANT_BY_GROUP_ID.replace('id', group.parentId),
        )
        .catch((err) =>
          this.logger.error('Error caching DESCENDANT_BY_GROUP_ID', err),
        );
    }

    this.redisCacheService
      .del(cacheKeys.GROUP.ALL)
      .catch((err) => this.logger.error('Error caching GROUP.ALL', err));
  }
}
