import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponMasterArRaw } from '@seaccentral/core/dist/raw-product/CouponMasterArRaw.entity';
import { CouponDetailArRaw } from '@seaccentral/core/dist/raw-product/CouponDetailArRaw.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { ARCouponDetailDto } from './dto/ARCouponDetailRequest.dto';
import { ARCouponMasterDto } from './dto/ARCouponMasterRequest.dto';

@Injectable()
export class ARCouponRawService {
  constructor(
    @InjectRepository(CouponMasterArRaw)
    private readonly couponMasterArRawRepository: Repository<CouponMasterArRaw>,
    @InjectRepository(CouponDetailArRaw)
    private readonly couponDetailArRawRepository: Repository<CouponDetailArRaw>,
  ) {}

  findCouponMaster(conditions?: FindManyOptions<CouponMasterArRaw>) {
    return this.couponMasterArRawRepository.find(conditions);
  }

  saveCouponMasters(couponMasters: ARCouponMasterDto[]) {
    const records = couponMasters.map<Partial<CouponMasterArRaw>>(
      (couponMaster) => ({
        couponCode: couponMaster.Coupon_Code,
        couponName: couponMaster.Coupon_Name,
        promoType: couponMaster.Promo_Type,
        couponType: couponMaster.Coupon_Type,
        promotion: couponMaster.Promotion,
        discountUom: couponMaster.Discount_UOM,
        status: couponMaster.Status,
        startDate: couponMaster.Start_Date,
        endDate: couponMaster.End_Date,
        quota: couponMaster.Quota,
        redeem: couponMaster.Redeem,
        remain: couponMaster.Remain,
        campaignBudget: couponMaster.Campaign_Budget,
        budgetUom: couponMaster.Budget_UOM,
        referenceCampaignName: couponMaster.Reference_Campaign_Name,
        usageCondition: couponMaster.Usage_Condition,
        productGroup: couponMaster.Product_Group,
        subProductGroup: couponMaster.Sub_Product_Group,
        eligibleSkuType: couponMaster.Eligible_SKU_Type,
        createBy: couponMaster.Create_by,
        updateDate: couponMaster.Update_Date,
      }),
    );

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

  saveCouponDetail(couponDetails: ARCouponDetailDto[]) {
    const records = couponDetails.map<Partial<CouponDetailArRaw>>((record) => ({
      couponCode: record.Coupon_Code,
      couponUniqueNo: record.Coupon_Unique_No,
      systemCreatedDate: record.System_Created_Date,
      used: record.Used,
    }));

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

  findCouponDetail(conditions?: FindManyOptions<CouponDetailArRaw>) {
    return this.couponDetailArRawRepository.find(conditions);
  }
}
