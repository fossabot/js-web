import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { EntityManager } from 'typeorm';
import faker from 'faker';
import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';

export async function createAddress(app: TestingModule | INestApplication) {
  const [district, subdistrict, province] = await Promise.all([
    app
      .get(EntityManager)
      .getRepository(District)
      .create({
        id: faker.datatype.number(),
        districtCode: '',
        districtNameEn: '',
        districtNameTh: '',
        provinceId: 0,
      })
      .save(),
    app
      .get(EntityManager)
      .getRepository(Subdistrict)
      .create({
        id: faker.datatype.number(),
        subdistrictCode: '',
        subdistrictNameEn: '',
        subdistrictNameTh: '',
        zipCode: '',
        provinceId: 0,
        districtId: 0,
      })
      .save(),
    app
      .get(EntityManager)
      .getRepository(Province)
      .create({
        id: faker.datatype.number(),
        provinceCode: '',
        provinceNameEn: '',
        provinceNameTh: '',
      })
      .save(),
  ]);

  return { province, district, subdistrict };
}

export async function createBillingAddress(
  app: TestingModule | INestApplication,
  user: User,
  isDefault = true,
) {
  const { province, district, subdistrict } = await createAddress(app);
  const billingAddress = await app
    .get(EntityManager)
    .getRepository(BillingAddress)
    .create({
      billingAddress: '',
      district,
      subdistrict,
      province,
      country: '',
      isDefault,
      user,
    })
    .save();

  return { billingAddress, district, province, subdistrict };
}
