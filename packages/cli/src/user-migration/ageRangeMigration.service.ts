import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { AgeRange as AgeRangeEntity } from '@seaccentral/core/dist/user/Range.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { Repository } from 'typeorm';
import { IAgeRangeResult } from '../instancy/instancy.service';
import { Migratable } from '../utils/migratable';

@Injectable()
export class AgeRangeMigrationService
  extends TransactionFor<AgeRangeMigrationService>
  implements Migratable<IAgeRangeResult>
{
  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(AgeRangeEntity)
    private readonly ageRangeRepository: Repository<AgeRangeEntity>,
  ) {
    super(moduleRef);
  }

  async migrate(row: IAgeRangeResult) {
    const { age_range: AgeRange } = row;
    if (!AgeRange) {
      return;
    }
    const range = this.getRange(AgeRange);
    if (!range) {
      return;
    }
    const ageRange = await this.ageRangeRepository.findOne({
      start: range.start,
      end: range.end,
    });
    if (ageRange) {
      // age range is static, so no need to update
      return;
    }

    await this.ageRangeRepository.insert({
      start: range.start,
      end: range.end,
      nameEn: AgeRange,
      nameTh: AgeRange,
    });
  }

  setup() {
    return Promise.resolve();
  }

  done() {
    return Promise.resolve();
  }

  getRange(rangeStr: string) {
    switch (rangeStr) {
      case '< 23':
        return { start: -1, end: 23 };
      case '23 - 30':
        return { start: 23, end: 30 };
      case '31 - 45':
        return { start: 31, end: 45 };
      case '46 - 60':
        return { start: 46, end: 60 };
      case '>60':
        return { start: 61, end: -1 };
      default:
        return null;
    }
  }
}
