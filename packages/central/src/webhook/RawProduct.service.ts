import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ProductUOMRaw } from '@seaccentral/core/dist/raw-product/ProductUOMRaw.entity';
import { ProductSKURaw } from '@seaccentral/core/dist/raw-product/ProductSKURaw.entity';
import { ProductItemRaw } from '@seaccentral/core/dist/raw-product/ProductItemRaw.entity';
import { ProductGroupRaw } from '@seaccentral/core/dist/raw-product/ProductGroupRaw.entity';
import { ProductCountryRaw } from '@seaccentral/core/dist/raw-product/ProductCountryRaw.entity';
import { ProductPartnerRaw } from '@seaccentral/core/dist/raw-product/ProductPartnerRaw.entity';
import { ProductSKULineRaw } from '@seaccentral/core/dist/raw-product/ProductSKULineRaw.entity';
import { ProductSubGroupRaw } from '@seaccentral/core/dist/raw-product/ProductSubGroupRaw.entity';
import { ProductSKUGroupRaw } from '@seaccentral/core/dist/raw-product/ProductSKUGroupRaw.entity';
import { ProductCurrencyRaw } from '@seaccentral/core/dist/raw-product/ProductCurrencyRaw.entity';
import { ProductPromotionRaw } from '@seaccentral/core/dist/raw-product/ProductPromotionRaw.entity';
import { SubscriptionPlan } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';

@Injectable()
export class RawProductService extends TransactionFor<RawProductService> {
  constructor(
    @InjectRepository(ProductGroupRaw)
    private productGroupRawRepository: Repository<ProductGroupRaw>,
    @InjectRepository(ProductSubGroupRaw)
    private productSubGroupRawRepository: Repository<ProductSubGroupRaw>,
    @InjectRepository(ProductSKUGroupRaw)
    private productSKUGroupRawRepository: Repository<ProductSKUGroupRaw>,
    @InjectRepository(ProductCountryRaw)
    private productCountryRawRepository: Repository<ProductCountryRaw>,
    @InjectRepository(ProductCurrencyRaw)
    private productCurrencyRawRepository: Repository<ProductCurrencyRaw>,
    @InjectRepository(ProductUOMRaw)
    private productUOMRawRepository: Repository<ProductUOMRaw>,
    @InjectRepository(ProductPartnerRaw)
    private productPartnerRawRepository: Repository<ProductPartnerRaw>,
    @InjectRepository(ProductPromotionRaw)
    private productPromotionRawRepository: Repository<ProductPromotionRaw>,
    @InjectRepository(ProductItemRaw)
    private productItemRawRepository: Repository<ProductItemRaw>,
    @InjectRepository(ProductSKURaw)
    private productSKURawRepository: Repository<ProductSKURaw>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(ProductSKULineRaw)
    private productSKULineRawRepository: Repository<ProductSKULineRaw>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  // TODO: May need to forward data to CMS per AR request
  async getGroup() {
    return this.productGroupRawRepository.find();
  }

  async getSubGroup() {
    return this.productSubGroupRawRepository.find();
  }

  async getSKUGroup() {
    return this.productSKUGroupRawRepository.find();
  }

  async getCountry() {
    return this.productCountryRawRepository.find();
  }

  async getCurrency() {
    return this.productCurrencyRawRepository.find();
  }

  async getUOM() {
    return this.productUOMRawRepository.find();
  }

  async getPartner() {
    return this.productPartnerRawRepository.find();
  }

  async getPromotion() {
    return this.productPromotionRawRepository.find();
  }

  async getItem() {
    return this.productItemRawRepository.find();
  }

  async getSKU() {
    return this.productSKURawRepository.find({
      relations: ['productSubGroup', 'skuGroup', 'currency', 'uom', 'partner'],
    });
  }

  async getSKULine() {
    return this.productSKULineRawRepository.find();
  }

  async getSubscriptionPlans() {
    return this.subscriptionPlanRepository.find();
  }
}
