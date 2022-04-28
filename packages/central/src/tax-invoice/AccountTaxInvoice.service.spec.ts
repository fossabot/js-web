import { TestingModule } from '@nestjs/testing';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { DeepPartial, EntityManager } from 'typeorm';
import faker from 'faker';
import { UserTaxInvoice } from '@seaccentral/core/dist/user/UserTaxInvoice.entity';
import {
  OfficeType,
  TaxType,
} from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { find } from 'lodash';
import { AccountTaxInvoiceService } from './AccountTaxInvoice.service';
import { UpsertTaxInvoiceDto } from './dto/UpsertTaxInvoice.dto';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';

async function createUserTaxInvoice(
  app: TestingModule,
  partial?: DeepPartial<UserTaxInvoice>,
) {
  const userRepository = app.get(EntityManager).getRepository(User);
  const userTaxInvoiceRepository = app
    .get(EntityManager)
    .getRepository(UserTaxInvoice);
  const provinceRepository = app.get(EntityManager).getRepository(Province);
  const districtRepository = app.get(EntityManager).getRepository(District);
  const subdistrictRepository = app
    .get(EntityManager)
    .getRepository(Subdistrict);
  const billingAddressRepository = app
    .get(EntityManager)
    .getRepository(BillingAddress);
  const [user, district, subdistrict, province] = await Promise.all([
    userRepository.save({ email: faker.internet.email() }),
    districtRepository.save({
      id: 1,
      districtCode: '0',
      districtNameEn: '',
      districtNameTh: '',
      provinceId: 0,
    }),
    subdistrictRepository.save({
      id: 1,
      subdistrictCode: '0',
      subdistrictNameEn: '',
      subdistrictNameTh: '',
      provinceId: 0,
      districtId: 0,
      zipCode: '',
    }),
    provinceRepository.save({
      id: 1,
      provinceCode: '0',
      provinceNameEn: '',
      provinceNameTh: '',
    }),
  ]);

  const taxInvoice = userTaxInvoiceRepository.create({
    isDefault: false,
    taxType: TaxType.INDIVIDUAL,
    officeType: OfficeType.HEAD_OFFICE,
    taxEntityName: 'Hello',
    taxId: '111111111112',
    taxAddress: 'somewhere',
    district,
    subdistrict,
    province,
    country: 'TH',
    zipCode: '10000',
    contactPerson: 'Mek',
    contactPhoneNumber: '081111111',
    contactEmail: 'mek@oozou.com',
    user,
    billingAddress: billingAddressRepository.create({
      billingAddress: '',
      district,
      subdistrict,
      province,
      country: 'TH',
      user,
      isDefault: false,
    }),
    ...partial,
  });

  return userTaxInvoiceRepository.save(taxInvoice);
}

describe('AccountTaxInvoiceService', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await setupApp();
  });

  afterEach(async () => {
    await teardownApp(app);
  });

  describe('#upsertUserTaxInvoice', () => {
    it('should create user tax invoice', async () => {
      const userTaxInvoiceRepository = app
        .get(EntityManager)
        .getRepository(UserTaxInvoice);
      const taxInvoice = await createUserTaxInvoice(app);
      await userTaxInvoiceRepository.delete(taxInvoice.id);
      const payload: UpsertTaxInvoiceDto = {
        ...taxInvoice,
        districtId: taxInvoice.district.id,
        provinceId: taxInvoice.province.id,
        subdistrictId: taxInvoice.subdistrict.id,
        billingAddress: undefined,
        id: undefined,
      };

      await app
        .get(AccountTaxInvoiceService)
        .upsertUserTaxInvoice(taxInvoice.user, payload);

      const savedTaxInvoice = await userTaxInvoiceRepository.find({
        user: taxInvoice.user,
      });
      expect(savedTaxInvoice.length).toEqual(1);
    });

    it('given no billing address, should update user tax invoice and remove billing address', async () => {
      const userTaxInvoiceRepository = app
        .get(EntityManager)
        .getRepository(UserTaxInvoice);
      const taxInvoice = await createUserTaxInvoice(app);
      const payload: UpsertTaxInvoiceDto = {
        ...taxInvoice,
        districtId: taxInvoice.district.id,
        provinceId: taxInvoice.province.id,
        subdistrictId: taxInvoice.subdistrict.id,
        billingAddress: undefined,
        taxEntityName: 'newName',
      };

      await app
        .get(AccountTaxInvoiceService)
        .upsertUserTaxInvoice(taxInvoice.user, payload);

      const savedTaxInvoice = await userTaxInvoiceRepository.find({
        user: taxInvoice.user,
      });
      expect(savedTaxInvoice.length).toEqual(1);
      expect(savedTaxInvoice[0].taxEntityName).toEqual('newName');
      expect(savedTaxInvoice[0].billingAddress).toBeNull();
    });

    it('given billing address, should update user tax invoice and billing address', async () => {
      const userTaxInvoiceRepository = app
        .get(EntityManager)
        .getRepository(UserTaxInvoice);
      const taxInvoice = await createUserTaxInvoice(app);
      const payload: UpsertTaxInvoiceDto = {
        ...taxInvoice,
        districtId: taxInvoice.district.id,
        provinceId: taxInvoice.province.id,
        subdistrictId: taxInvoice.subdistrict.id,
        billingAddress: {
          ...(taxInvoice.billingAddress as BillingAddress),
          provinceId: taxInvoice.province.id,
          districtId: taxInvoice.district.id,
          subdistrictId: taxInvoice.subdistrict.id,
          billingAddress: 'newAddress',
        },
        taxEntityName: 'newName',
      };

      await app
        .get(AccountTaxInvoiceService)
        .upsertUserTaxInvoice(taxInvoice.user, payload);

      const savedTaxInvoice = await userTaxInvoiceRepository.find({
        user: taxInvoice.user,
      });
      expect(savedTaxInvoice.length).toEqual(1);
      expect(savedTaxInvoice[0].taxEntityName).toEqual('newName');
      expect(savedTaxInvoice[0].billingAddress?.billingAddress).toEqual(
        'newAddress',
      );
    });

    it('given isDefault = false and no tax invoice exists, should set isDefault = true', async () => {
      const userTaxInvoiceRepository = app
        .get(EntityManager)
        .getRepository(UserTaxInvoice);
      const taxInvoice = await createUserTaxInvoice(app, { isDefault: false });
      await userTaxInvoiceRepository.delete(taxInvoice.id);
      const payload: UpsertTaxInvoiceDto = {
        ...taxInvoice,
        id: undefined,
        districtId: taxInvoice.district.id,
        provinceId: taxInvoice.province.id,
        subdistrictId: taxInvoice.subdistrict.id,
        billingAddress: {
          ...(taxInvoice.billingAddress as BillingAddress),
          id: undefined,
          provinceId: taxInvoice.province.id,
          districtId: taxInvoice.district.id,
          subdistrictId: taxInvoice.subdistrict.id,
        },
      };

      await app
        .get(AccountTaxInvoiceService)
        .upsertUserTaxInvoice(taxInvoice.user, payload);

      const savedTaxInvoice = await userTaxInvoiceRepository.find({
        user: taxInvoice.user,
      });
      expect(savedTaxInvoice.length).toEqual(1);
      expect(savedTaxInvoice[0].isDefault).toEqual(true);
    });

    it('given isDefault = true and have >= 1 tax invoices, should set isDefault = true and others false', async () => {
      const userTaxInvoiceRepository = app
        .get(EntityManager)
        .getRepository(UserTaxInvoice);
      const existingTaxInvoice = await createUserTaxInvoice(app, {
        isDefault: false,
      });
      const taxInvoice = await createUserTaxInvoice(app, {
        isDefault: true,
        user: existingTaxInvoice.user,
      });
      await userTaxInvoiceRepository.delete(taxInvoice.id);
      const payload: UpsertTaxInvoiceDto = {
        ...taxInvoice,
        id: undefined,
        districtId: taxInvoice.district.id,
        provinceId: taxInvoice.province.id,
        subdistrictId: taxInvoice.subdistrict.id,
        billingAddress: {
          ...(taxInvoice.billingAddress as BillingAddress),
          id: undefined,
          provinceId: taxInvoice.province.id,
          districtId: taxInvoice.district.id,
          subdistrictId: taxInvoice.subdistrict.id,
        },
      };

      const out = await app
        .get(AccountTaxInvoiceService)
        .upsertUserTaxInvoice(taxInvoice.user, payload);

      const savedTaxInvoice = await userTaxInvoiceRepository.find({
        user: taxInvoice.user,
      });
      expect(savedTaxInvoice.length).toEqual(2);
      expect(
        find(savedTaxInvoice, { id: out.id, isDefault: true }),
      ).toBeDefined();
      expect(
        find(savedTaxInvoice, { id: existingTaxInvoice.id, isDefault: false }),
      ).toBeDefined();
    });
  });

  describe('#deleteTaxInvoice', () => {
    it('given userTaxInvoice id, should delete the entity', async () => {
      const newTaxInvoice = await createUserTaxInvoice(app);

      const taxInvoices = await app
        .get(AccountTaxInvoiceService)
        .deleteUserTaxInvoice(newTaxInvoice.user, newTaxInvoice.id);

      expect(taxInvoices.affected).toEqual(1);
    });
  });
});
