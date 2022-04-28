import { orderBy } from 'lodash';
import { IsNull, Repository, Not, FindOneOptions } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { addToDateByPlan } from '@seaccentral/core/dist/utils/date';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

import { CreatePlan } from './dto/CreatePlan.dto';
import { UpdatePlan } from './dto/UpdatePlan.dto';
import { GetPlanQuery } from './dto/GetPlanQuery.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async findAll(query: GetPlanQuery & { skip: number; take: number }) {
    let dbQuery = this.subscriptionPlanRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.courseOutlineBundle', 'bundle')
      .where(
        query.searchField ? `plan.${query.searchField} like :searchField` : '',
        {
          searchField: `%${query.search}%`,
        },
      );

    if (query.courseOutlineId) {
      dbQuery = dbQuery
        .leftJoinAndSelect('bundle.courseOutline', 'outline')
        .andWhere('outline.id = :courseOutlineId', {
          courseOutlineId: query.courseOutlineId,
        });
    }

    const result = await dbQuery
      .orderBy(
        query.orderBy,
        query.order ? (query.order.toUpperCase() as any) : 'ASC',
      )
      .skip(query.skip)
      .take(query.take)
      .getManyAndCount();

    return result;
  }

  async getById(planId: string, withCourseBundles = false) {
    const options: FindOneOptions<SubscriptionPlan> = {};

    if (withCourseBundles) {
      options.relations = ['courseOutlineBundle'];
    }

    const plan = await this.subscriptionPlanRepository.findOne(planId, options);

    if (!plan) {
      throw new HttpException('Plan with id not found', HttpStatus.NOT_FOUND);
    }

    return plan;
  }

  async getPublicPlans(query: GetPlanQuery & { skip: number; take: number }) {
    const conditions: any = { isPublic: true, isActive: true };

    if (query && !!query.linked) {
      conditions.externalProvider = Not(IsNull());
    }

    if (query && !!query.unlinked) {
      conditions.externalProvider = IsNull();
    }

    if (query && !!query.organizationId) {
      conditions.externalProvider = { id: query.organizationId };
    }

    if (query && !!query.packageType) {
      conditions.packageType = query.packageType;
    }

    const count = await this.subscriptionPlanRepository.count(conditions);
    const result = await this.subscriptionPlanRepository.find({
      skip: query.skip,
      take: query.take,
      order: {
        createdAt: 'ASC',
      },
      where: conditions,
    });

    if (query.orderByDuration) {
      return {
        plans: orderBy(
          result,
          (plan) => addToDateByPlan(new Date(), plan),
          query.orderByDuration,
        ),
        count,
      };
    }

    return { plans: result, count };
  }

  async getPublicPlanById(planId: string) {
    const plan = await this.subscriptionPlanRepository.findOne(planId, {
      where: { isActive: true, isPublic: true },
    });

    if (!plan) {
      throw new HttpException('Plan with id not found', HttpStatus.NOT_FOUND);
    }

    return plan;
  }

  async linkWithOrganization(planId: string, organizationId: string) {
    const plan = await this.subscriptionPlanRepository.findOne(planId, {
      where: { isActive: true },
    });

    if (!plan) {
      throw new HttpException(
        'Plan with this id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (plan.externalProvider) {
      throw new HttpException(
        'Plan already linked with organization',
        HttpStatus.BAD_REQUEST,
      );
    }

    const organization = await this.organizationRepository.findOne(
      organizationId,
    );

    if (!organization) {
      throw new HttpException(
        'Organization with this id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!organization.isServiceProvider) {
      throw new HttpException(
        'Organization must be a service provider',
        HttpStatus.BAD_REQUEST,
      );
    }

    plan.externalProvider = organization;

    await this.subscriptionPlanRepository.save(plan);

    return plan;
  }

  async unlinkWithOrganization(planId: string, organizationId: string) {
    const plan = await this.subscriptionPlanRepository.findOne(planId);

    if (!plan) {
      throw new HttpException(
        'Plan with this id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!plan.externalProvider || plan.externalProvider.id !== organizationId) {
      throw new HttpException(
        'Plan is not linked with organization',
        HttpStatus.BAD_REQUEST,
      );
    }

    const organization = await this.organizationRepository.findOne(
      organizationId,
    );

    if (!organization) {
      throw new HttpException(
        'Organization with this id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    plan.externalProvider = null;

    await this.subscriptionPlanRepository.save(plan);

    return plan;
  }

  async createPlan(planBody: CreatePlan) {
    try {
      const newPlan = this.subscriptionPlanRepository.create(planBody);
      await this.subscriptionPlanRepository.save(newPlan);

      return newPlan;
    } catch (error) {
      if (error.constraint === 'subscription_plan_productId_unique') {
        throw new HttpException(
          'Plan with this product id already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  async updatePlan(id: string, planBody: UpdatePlan) {
    const plan = await this.subscriptionPlanRepository.findOne(id);

    if (!plan) {
      throw new HttpException(
        'Plan with this id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!planBody.externalProviderType) {
      plan.externalProviderType = null;
    }

    if (!planBody.packageType) {
      plan.packageType = null;
    }

    await this.subscriptionPlanRepository.save({
      ...plan,
      ...planBody,
      courseOutlineBundle: planBody.courseBundleIds
        ? planBody.courseBundleIds.map((courseBundleId) => ({
            id: courseBundleId,
          }))
        : undefined,
    });
    return plan;
  }
}
