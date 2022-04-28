import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, ILike, Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Role } from '@seaccentral/core/dist/user/Role.entity';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { RolePolicy } from '@seaccentral/core/dist/user/RolePolicy.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';

import { RoleBody } from './dto/RoleBody';

@Injectable()
export class RoleService extends TransactionFor<RoleService> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePolicy)
    private readonly rolePolicyRepository: Repository<RolePolicy>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async getAllRoles(query: BaseQueryDto) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const count = await this.roleRepository.count(searchField);
    const roles = await this.roleRepository.find({
      where: {
        ...searchField,
        isActive: true,
      },
      skip: query.skip,
      take: query.take,
      order: {
        ...orderByField,
      },
    });

    return { roles, count };
  }

  async getById(id: string, options?: { withRolePolicies: boolean }) {
    const findOptions: FindOneOptions<Role> = {};

    if (options?.withRolePolicies) {
      findOptions.relations = ['rolePolicy'];
    }

    const role = await this.roleRepository.findOne(id, findOptions);

    if (!role) {
      throw new HttpException('Role with id not found', HttpStatus.NOT_FOUND);
    }

    return role;
  }

  async createRole(body: RoleBody) {
    const roleToCreate = this.roleRepository.create({
      name: body.name,
      description: body.description,
    });

    const role = await this.roleRepository.save(roleToCreate);
    return role;
  }

  async updateRole(id: string, body: RoleBody) {
    const role = await this.roleRepository.findOne(id, {
      where: { isActive: true },
    });

    if (!role) {
      throw new HttpException('Role with id not found', HttpStatus.NOT_FOUND);
    }

    role.name = body.name;
    role.description = body.description;

    const updatedRole = await this.roleRepository.save(role);
    return updatedRole;
  }

  async deleteRole(id: string) {
    const role = await this.roleRepository.findOne(id, {
      where: { isActive: true },
    });

    if (!role) {
      throw new HttpException('Role with id not found', HttpStatus.NOT_FOUND);
    }

    if (role.isSystemDefined) {
      throw new HttpException(
        'System defined roles cannot be deleted',
        HttpStatus.FORBIDDEN,
      );
    }
    const userRole = await this.userRoleRepository.findOne({
      where: { role },
    });

    if (userRole) {
      throw new HttpException(
        'Cannot delete role associated to the user.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.roleRepository.remove(role);
  }

  async updateRolePolicies(roleId: string, policyIds: string[]) {
    const role = await this.roleRepository.findOne(roleId);

    if (!role) {
      throw new HttpException('Role with id not found', HttpStatus.NOT_FOUND);
    }

    await this.rolePolicyRepository.delete({ role });
    const rolePolicies = policyIds.map((pIds) =>
      this.rolePolicyRepository.create({ role, policy: { id: pIds } }),
    );

    await this.rolePolicyRepository.save(rolePolicies);
  }
}
