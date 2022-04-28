import numeral from 'numeral';
import { chunk } from 'lodash';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Industry } from '../user/Industry.entity';
import { CompanySizeRange } from '../user/Range.entity';
import { TransactionFor } from '../utils/withTransaction';
import organizationSizes from '../assets/organization-sizes.json';
import companyIndustries from '../assets/company-industries.json';

interface CompanyIndustry {
  name: string;
  code: string;
  locale: string;
}

interface OrganizationSize {
  name: string;
  code: number;
  locale: string;
}

@Injectable()
export class ProfileSeedService extends TransactionFor<ProfileSeedService> {
  constructor(
    @InjectRepository(Industry)
    private readonly companyIndustryRepository: Repository<Industry>,
    @InjectRepository(CompanySizeRange)
    private readonly companySizeRangeRepository: Repository<CompanySizeRange>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  seedCompanyIndustries() {
    const seeds = companyIndustries as CompanyIndustry[];
    const promises = chunk(seeds, 2).map(async (langPair) => {
      const [th, en] = langPair;
      const [_, count] = await this.companyIndustryRepository.findAndCount({
        nameEn: en.name,
        nameTh: th.name,
      });
      if (count > 0) {
        return null;
      }
      return this.companyIndustryRepository.insert({
        nameEn: en.name,
        nameTh: th.name,
      });
    });

    return Promise.all(promises);
  }

  async seedOrganizationSizes() {
    const seeds = organizationSizes as OrganizationSize[];
    const promises = chunk(seeds, 2).map(async (langPair) => {
      const [th, en] = langPair;
      const enRange = this.extractOrganizationSize(en);
      const [_, count] = await this.companySizeRangeRepository.findAndCount({
        nameEn: en.name,
        nameTh: th.name,
      });
      if (count > 0) {
        return null;
      }
      return this.companySizeRangeRepository.insert({
        start: enRange.start,
        end: enRange.end,
        nameEn: en.name,
        nameTh: th.name,
      });
    });

    return Promise.all(promises);
  }

  private extractOrganizationSize(data: OrganizationSize) {
    const { name } = data;

    if (name.includes('<')) {
      const [_, value] = name.split('<');
      return {
        start: -1,
        end: numeral(value).value() as number,
      };
    }
    if (name.includes('-')) {
      const [from, to] = name.split('-');
      return {
        start: numeral(from).value() as number,
        end: numeral(to).value() as number,
      };
    }
    if (name.includes('>')) {
      const [_, value] = name.split('>');
      return {
        start: numeral(value).value() as number,
        end: -1,
      };
    }
    throw new Error(
      `'${name}' has no range pattern found (expect '<', '-', or '>')`,
    );
  }
}
