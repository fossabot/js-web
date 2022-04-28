import { flatten, uniq } from 'lodash';
import { ILike, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Policy } from '@seaccentral/core/dist/user/Policy.entity';
import { UserRole } from '@seaccentral/core/dist/user/UserRole.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { RolePolicy } from '@seaccentral/core/dist/user/RolePolicy.entity';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(RolePolicy)
    private readonly rolePolicyRepository: Repository<RolePolicy>,
  ) {}

  async getPolicies(user: User) {
    const userRoles = await this.userRoleRepository.find({ user });
    const userRolePolicies = await Promise.all(
      userRoles.map((userRole) =>
        this.rolePolicyRepository.find({ role: userRole.role }),
      ),
    );

    return uniq(flatten(userRolePolicies).map(({ policy }) => policy.name));
  }

  async getAllPolicies(query: BaseQueryDto) {
    const searchField = query.searchField
      ? { [query.searchField]: ILike(`%${query.search}%`) }
      : {};
    const orderByField = query.orderBy ? { [query.orderBy]: query.order } : {};

    const count = await this.policyRepository.count(searchField);
    const policies = await this.policyRepository.find({
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

    return { policies, count };
  }
}
