import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EligibleSkuCodeArRaw } from '@seaccentral/core/dist/raw-product/EligibleSkuCodeArRaw.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { AREligibleSkuDto } from './dto/AREligibleSkuRequest.dto';

@Injectable()
export class AREligibleSkuRawService {
  constructor(
    @InjectRepository(EligibleSkuCodeArRaw)
    private readonly eligibleSkuCodeArRawRepository: Repository<EligibleSkuCodeArRaw>,
  ) {}

  saveEligibleSku(arEligibleSkuDto: AREligibleSkuDto[]) {
    const records = arEligibleSkuDto.map<Partial<EligibleSkuCodeArRaw>>(
      (record) => ({
        eligibleSkuCode: record.Eligible_SKU_Code,
        eligibleSkuName: record.Eligible_SKU_Name,
        couponCode: record.Coupon_Code,
      }),
    );

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

  findEligiblesku(conditions?: FindManyOptions<EligibleSkuCodeArRaw>) {
    return this.eligibleSkuCodeArRawRepository.find(conditions);
  }
}
