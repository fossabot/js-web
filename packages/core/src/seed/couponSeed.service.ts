/**
 * https://documenter.getpostman.com/view/4991586/U16htmko
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CouponDetailArRaw } from '../raw-product/CouponDetailArRaw.entity';
import { CouponMasterArRaw } from '../raw-product/CouponMasterArRaw.entity';
import { EligibleSkuCodeArRaw } from '../raw-product/EligibleSkuCodeArRaw.entity';

@Injectable()
export class CouponSeedService {
  constructor(
    @InjectRepository(CouponDetailArRaw)
    private readonly couponDetailArRawRepository: Repository<CouponDetailArRaw>,
    @InjectRepository(CouponMasterArRaw)
    private readonly couponMasterArRawRepository: Repository<CouponMasterArRaw>,
    @InjectRepository(EligibleSkuCodeArRaw)
    private readonly eligibleSkuCodeArRawRepository: Repository<EligibleSkuCodeArRaw>,
  ) {}

  async seedCouponMaster() {
    const records: Partial<CouponMasterArRaw>[] = [
      {
        couponCode: 'FLAT100',
        couponName: 'Promotion for Package xxxxxxxxx',
        promoType: 'Discount',
        couponType: 'Seasonal',
        promotion: '100',
        discountUom: 'THB',
        status: 'Active',
        startDate: new Date('2021-10-21 00:00:00.000 +0700'),
        endDate: new Date('2021-10-21 00:00:00.000 +0700'),
        quota: 500,
        redeem: 400,
        remain: 100,
        campaignBudget: '100000.00',
        budgetUom: 'THB',
        referenceCampaignName: 'Valentine Campaign 2021',
        usageCondition: 'All members applied on Website',
        productGroup: 'Subscription',
        subProductGroup: 'YourNextU',
        eligibleSkuType: 'By SKU',
        createBy: 'Admin',
        updateDate: new Date('2021-10-21 00:00:00.000 +0700'),
      },
      {
        couponCode: 'FLAT100ALL',
        couponName: 'Promotion for Package xxxxxxxxx',
        promoType: 'Discount',
        couponType: 'Seasonal',
        promotion: '100',
        discountUom: 'THB',
        status: 'Active',
        startDate: new Date('2021-10-21 00:00:00.000 +0700'),
        endDate: new Date('2021-10-21 00:00:00.000 +0700'),
        quota: 500,
        redeem: 400,
        remain: 100,
        campaignBudget: '100000.00',
        budgetUom: 'THB',
        referenceCampaignName: 'Valentine Campaign 2021',
        usageCondition: 'All members applied on Website',
        productGroup: 'Subscription',
        subProductGroup: 'YourNextU',
        eligibleSkuType: 'ALL',
        createBy: 'Admin',
        updateDate: new Date('2021-10-21 00:00:00.000 +0700'),
      },
      {
        couponCode: 'PERCENT10',
        couponName: 'Promotion for Package xxxxxxxxx',
        promoType: 'Discount',
        couponType: 'Seasonal',
        promotion: '10',
        discountUom: '%',
        status: 'Active',
        startDate: new Date('2021-10-21 00:00:00.000 +0700'),
        endDate: new Date('2021-10-21 00:00:00.000 +0700'),
        quota: 100,
        redeem: 50,
        remain: 50,
        campaignBudget: '50000.00',
        budgetUom: 'THB',
        referenceCampaignName: 'New Year Campaign 2022',
        usageCondition: 'All members applied on Website',
        productGroup: 'Subscription',
        subProductGroup: 'YourNextU',
        eligibleSkuType: 'By SKU',
        createBy: 'Admin',
        updateDate: new Date('2021-10-21 00:00:00.000 +0700'),
      },
    ];
    return this.couponMasterArRawRepository
      .createQueryBuilder()
      .insert()
      .values(records)
      .orUpdate({
        conflict_target: ['couponCode'],
        overwrite: Object.keys(records[0]),
      })
      .execute();
  }

  async seedCouponDetail() {
    const records: Partial<CouponDetailArRaw>[] = [
      {
        couponCode: 'FLAT100',
        couponUniqueNo: 'FLAT100-1',
        systemCreatedDate: new Date('2021-12-16 17:07:34.277 +0700'),
        used: false,
      },
      {
        couponCode: 'FLAT100ALL',
        couponUniqueNo: 'FLAT100ALL-1',
        systemCreatedDate: new Date('2021-12-16 17:07:34.277 +0700'),
        used: false,
      },
      {
        couponCode: 'PERCENT10',
        couponUniqueNo: 'PERCENT10-1',
        systemCreatedDate: new Date('2021-12-16 17:07:34.277 +0700'),
        used: false,
      },
    ];

    return this.couponDetailArRawRepository
      .createQueryBuilder()
      .insert()
      .values(records)
      .orUpdate({
        conflict_target: ['couponUniqueNo'],
        overwrite: Object.keys(records[0]),
      })
      .execute();
  }

  async seedEligibleSkuCode() {
    const records: Partial<EligibleSkuCodeArRaw>[] = [
      {
        eligibleSkuCode: 'CSNACUST0002',
        eligibleSkuName:
          'Customerized Product - For Mapping Quoatation Only - One time use - 0002',
        couponCode: 'FLAT100',
      },
      {
        eligibleSkuCode: 'YNUA01MN0001',
        eligibleSkuName: 'For YourNextU Full Pack',
        couponCode: 'PERCENT10',
      },
    ];

    return this.eligibleSkuCodeArRawRepository
      .createQueryBuilder()
      .insert()
      .values(records)
      .orUpdate({
        conflict_target: ['eligibleSkuCode', 'couponCode'],
        overwrite: Object.keys(records[0]),
      })
      .execute();
  }
}
