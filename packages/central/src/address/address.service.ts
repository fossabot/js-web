import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import { Repository } from 'typeorm';
import { startCase } from 'lodash';
import {
  getDistrictData,
  getProvinceData,
  getSubdistrictData,
  IDistrictData,
  IProvinceData,
  ISubdistrictData,
} from './zipcode/service';
import { GetZipcodeQueryDTO } from './dto/GetZipcode.dto';
import { GetProvinceQueryDTO } from './dto/GetProvinceQuery.dto';
import { GetDistrictQueryDTO } from './dto/GetDistrictQuery.dto';
import { GetSubdistrictQueryDTO } from './dto/GetSubdistrictQuery.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    @InjectRepository(Subdistrict)
    private subdistrictRepository: Repository<Subdistrict>,
  ) {}

  async getSubdistricts(query: GetSubdistrictQueryDTO) {
    const { locale, provinceId, districtId } = query;

    return this.subdistrictRepository.find({
      where: {
        provinceId,
        districtId,
      },
      order: {
        [`subdistrictName${startCase(locale)}`]: 'ASC',
      },
    });
  }

  async getDistricts(query: GetDistrictQueryDTO) {
    const { locale, provinceId } = query;

    return this.districtRepository.find({
      where: {
        provinceId,
      },
      order: {
        [`districtName${startCase(locale)}`]: 'ASC',
      },
    });
  }

  async getProvinces(query: GetProvinceQueryDTO) {
    const { locale, id } = query;

    if (id)
      return this.provinceRepository.find({
        where: {
          id,
        },
        order: {
          [`provinceName${startCase(locale)}`]: 'ASC',
        },
      });

    return this.provinceRepository
      .createQueryBuilder('province')
      .select()
      .orderBy("(CASE WHEN province.provinceNameEn='Bangkok' THEN 1 END)")
      .addOrderBy(`province.provinceName${startCase(locale)}`, 'ASC')
      .getMany();
  }

  async getZipcodes(query: GetZipcodeQueryDTO) {
    const { locale, ...conditions } = query;

    return this.subdistrictRepository.find({
      where: {
        ...conditions,
      },
      order: {
        [`subdistrictName${startCase(locale)}`]: 'ASC',
      },
    });
  }

  async seedAddress() {
    const provinces = getProvinceData();
    const districts = getDistrictData();
    const subdistricts = getSubdistrictData();

    await this.seedProvince(provinces);
    await this.seedDistrict(districts);
    await this.seedSubdistrict(subdistricts);
  }

  private async seedProvince(provinces: IProvinceData[]) {
    const existingProvince = await this.provinceRepository.findOne();
    if (existingProvince) {
      return;
    }

    const provinceEntities = provinces.map(
      (province): Partial<Province> => ({
        id: province.id,
        provinceCode: province.province_code,
        provinceNameEn: province.province_name_en,
        provinceNameTh: province.province_name,
      }),
    );

    await this.provinceRepository
      .createQueryBuilder()
      .insert()
      .into(Province)
      .values(provinceEntities)
      .execute();
  }

  private async seedDistrict(districts: IDistrictData[]) {
    const existingDistrict = await this.districtRepository.findOne();
    if (existingDistrict) {
      return;
    }

    const districtEntities = districts.map(
      (district): Partial<District> => ({
        id: district.id,
        districtCode: district.district_code,
        districtNameEn: district.district_name_en,
        districtNameTh: district.district_name,
        provinceId: district.province_id,
      }),
    );

    await this.districtRepository
      .createQueryBuilder()
      .insert()
      .into(District)
      .values(districtEntities)
      .execute();
  }

  private async seedSubdistrict(subdistricts: ISubdistrictData[]) {
    const existingSubdistrict = await this.subdistrictRepository.findOne();
    if (existingSubdistrict) {
      return;
    }

    const subdistrictEntities = subdistricts.map(
      (subdistrict): Partial<Subdistrict> => ({
        id: subdistrict.id,
        districtId: subdistrict.district_id,
        provinceId: subdistrict.province_id,
        subdistrictCode: subdistrict.subdistrict_code,
        subdistrictNameEn: subdistrict.subdistrict_name_en,
        subdistrictNameTh: subdistrict.subdistrict_name,
        zipCode: subdistrict.zip_code,
      }),
    );

    await this.subdistrictRepository
      .createQueryBuilder()
      .insert()
      .into(Subdistrict)
      .values(subdistrictEntities)
      .execute();
  }
}
