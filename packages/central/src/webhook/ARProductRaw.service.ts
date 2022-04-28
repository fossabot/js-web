import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProductArRaw,
  ProductAvailability,
} from '@seaccentral/core/dist/raw-product/ProductArRaw.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { defaultTo, omit } from 'lodash';
import { ARProductDto } from './dto/ARProductRequest.dto';

@Injectable()
export class ARProductRawService {
  constructor(
    @InjectRepository(ProductArRaw)
    private readonly productArRawRepository: Repository<ProductArRaw>,
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async saveProducts(arProductRequest: ARProductDto[]) {
    const records = arProductRequest.map<Partial<ProductArRaw>>((record) => ({
      productGroup: record.Product_Group,
      subProductGroup: record.Sub_Product_Group,
      partner: record.Partner,
      deliveryFormat: record.Delivery_Format,
      itemCategory: record.Item_Category,
      no: record.No,
      description: record.Description,
      periodYear: record.Period_Year,
      periodMonth: record.Period_Month,
      periodDay: record.Period_Day,
      baseUnitOfMeasure: record.Base_Unit_of_Measure,
      unitPrice: record.Unit_Price,
      currency: record.Currency,
      countryRegionOfOriginCode: record.Country_Region_of_Origin_Code,
      productAvailability: record.Product_Availability,
      shelfLife: record.Shelf_Life,
      revenueType: record.Revenue_Type,
      thirdPartyLicenseFee: record.Third_Party_License_Fee,
    }));

    const result = await this.productArRawRepository
      .createQueryBuilder()
      .insert()
      .values(records)
      .orUpdate({
        conflict_target: ['no'],
        overwrite: Object.keys(records[0]),
      })
      .returning('*')
      .execute();

    const subscriptionPlans = result.generatedMaps.map<
      DeepPartial<SubscriptionPlan>
    >((record) => ({
      name: record.description,
      displayName: record.description,
      productId: record.no,
      productSKU: record,
      productSKUId: record.id,
      price: record.unitPrice,
      currency: defaultTo(record.currency, 'THB'),
      periodDay: record.periodDay,
      periodMonth: record.periodMonth,
      periodYear: record.periodYear,
      isPublic: record.productAvailability === ProductAvailability.Available,
      isActive: record.productAvailability === ProductAvailability.Available,
      allowRenew: record.productGroup === 'Subscription',
    }));

    await this.subscriptionPlanRepository
      .createQueryBuilder()
      .insert()
      .values(subscriptionPlans)
      .orUpdate({
        conflict_target: ['productId'],
        overwrite: Object.keys(omit(subscriptionPlans[0], 'productSKU')),
      })
      .execute();

    return result;
  }

  findProduct(conditions?: FindManyOptions<ProductArRaw>) {
    return this.productArRawRepository.find(conditions);
  }
}
