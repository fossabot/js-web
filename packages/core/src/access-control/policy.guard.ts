/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  OnModuleInit,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { flatten, uniq, isUndefined } from 'lodash';
import { Policy } from '../user/Policy.entity';
import { UserRole } from '../user/UserRole.entity';
import { User } from '../user/User.entity';
import { POLICY_METADATA, Policy as PolicyDecorator } from './policy.decorator';
import { ModuleRefProxy } from './moduleRefProxy';
import { RolePolicy } from '../user/RolePolicy.entity';
import { GOD_MODE } from './constants';

type ClassOrMethod = Type<any> | ((...args: any[]) => any | any[]);

export interface IPolicyGuard extends CanActivate, OnModuleInit {
  customActivator: CanActivate;
}

/**
 * For other subsequent guards or route handlers that uses user policies
 */
export interface UserPolicies {
  userPolicies: Set<string>;
}

function getPolicies(classesOrMethods: ClassOrMethod[]) {
  const policiesArgs = classesOrMethods.map<string>((target: ClassOrMethod) => {
    const policies = Reflect.getMetadata(POLICY_METADATA, target);
    if (isUndefined(policies)) {
      throw new Error(
        `"${target.name}" doesn't have any policy applied. Please add @${PolicyDecorator.name} to it or remove "${target.name}" from this guard`,
      );
    }

    const isClass = !isUndefined(target.prototype);
    if (isClass) {
      const ConstructorAndmethods = Reflect.ownKeys(target.prototype);
      const methodPolicies = ConstructorAndmethods.map((handler) =>
        Reflect.getMetadata(POLICY_METADATA, target.prototype[handler]),
      ).filter((value) => value);
      return flatten(methodPolicies);
    }

    return policies;
  });

  return uniq(flatten(policiesArgs));
}

function createPolicyGuard({
  activate,
  ActivatorOverride,
}: {
  activate: ClassOrMethod[];
  ActivatorOverride?: Type<CanActivate>;
}): Type<IPolicyGuard> {
  @Injectable()
  class _PolicyGuard implements IPolicyGuard {
    private policies: string[] = getPolicies(activate);

    customActivator: CanActivate;

    constructor(
      @InjectRepository(UserRole)
      private readonly userRoleRepository: Repository<UserRole>,
      @InjectRepository(Policy)
      private readonly policyRepository: Repository<Policy>,
      @InjectRepository(RolePolicy)
      private readonly rolePolicyRepository: Repository<RolePolicy>,
      private readonly moduleRef: ModuleRef,
    ) {}

    async onModuleInit() {
      if (ActivatorOverride) {
        this.customActivator = new ActivatorOverride(
          this.policies,
          new ModuleRefProxy(this.moduleRef),
        );
      }

      const populatePromises = this.policies.map((policy) =>
        this.policyRepository
          .createQueryBuilder()
          .insert()
          .values({ name: policy })
          .orIgnore()
          .execute(),
      );

      await Promise.all(populatePromises);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context
        .switchToHttp()
        .getRequest<Request & UserPolicies>();
      if (!request.user) {
        return false;
      }
      const user = request.user as User;
      const userRoles = await this.userRoleRepository.find({
        relations: ['role'],
        where: {
          user,
        },
      });
      const userRolePolicies = await Promise.all(
        userRoles.map(({ role }) => {
          return this.rolePolicyRepository.find({ where: { role } });
        }),
      );
      const userPolicies = new Set(
        flatten(userRolePolicies).map(({ policy }) => policy.name),
      );
      request.userPolicies = userPolicies;
      const requiredPolicies = new Set(this.policies);
      if (userPolicies.has(GOD_MODE.GRANT_ALL_ACCESS)) {
        return true;
      }
      const requiredPoliciesArray = Array.from(requiredPolicies);
      const isGranted =
        requiredPoliciesArray.length === 0 ||
        requiredPoliciesArray.some((policyName) =>
          userPolicies.has(policyName),
        );

      if (this.customActivator) {
        const isActivatorGranted = await this.customActivator.canActivate(
          context,
        );
        return isGranted || (isActivatorGranted as boolean);
      }

      return isGranted;
    }
  }

  // return a different class every time it is initialized
  // so that it doesn't have weird side effects like https://stackoverflow.com/questions/63177279/guard-factory-in-nestjs-application
  return mixin(_PolicyGuard);
}

export function PolicyGuard(
  activateClassOrMethod: ClassOrMethod,
  ...rest: ClassOrMethod[]
) {
  return createPolicyGuard({
    activate: [activateClassOrMethod, ...rest],
  });
}

export function PolicyActivatorGuard<T extends CanActivate>(
  customActivator: Type<T>,
  activateClassOrMethod: ClassOrMethod,
  ...rest: ClassOrMethod[]
) {
  return createPolicyGuard({
    activate: [activateClassOrMethod, ...rest],
    ActivatorOverride: customActivator,
  });
}
