import { TestingModule } from '@nestjs/testing';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { EntityManager } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import faker from 'faker';
import { setupApp, teardownApp } from '../utils/testHelpers/setup-integration';
import { BillingAddressService } from './billingAddress.service';
import { UpsertBillingAddressDto } from './dto/UpsertBillingAddress.dto';
import {
  createAddress,
  createBillingAddress,
} from './test-utils/address-setup';
import { DeleteBillingAddressDto } from './dto/DeleteBillingAddress.dto';
import { serializeDto } from '../utils/testHelpers/serialize-dto';

function createUser(app: TestingModule | INestApplication) {
  return app
    .get(EntityManager)
    .getRepository(User)
    .create({
      email: faker.internet.email(),
      firstName: 'john',
      lastName: 'doe',
    })
    .save();
}

describe('BillingAddressService', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await setupApp();
  });

  afterEach(async () => {
    await teardownApp(app);
  });

  describe('#getBillingAddress', () => {
    it('should return [] given that user has no billing address', async () => {
      const user = await createUser(app);

      const addresses = await app
        .get(BillingAddressService)
        .getBillingAddress(user);

      expect(addresses).toEqual([]);
    });

    it('should reuturn expected billing address given that user has > 0 address', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);

      const addresses = await app
        .get(BillingAddressService)
        .getBillingAddress(user);

      expect(addresses.length).toEqual(1);
      expect(addresses[0].id).toEqual(billingAddress.id);
    });
  });

  describe('#updateBillingAddress', () => {
    it('should update existing billing address given dto id field exist', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);
      const { district, subdistrict, province } = await createBillingAddress(
        app,
        user,
      );
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: billingAddress.id,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
        }),
      );

      const address = await app
        .get(BillingAddressService)
        .updateBillingAddress(dto, user);

      const { provinceId, districtId, subdistrictId, ...rest } = dto;
      await app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .findOneOrFail({ id: address.id });
      expect(address.province.id).toEqual(provinceId);
      expect(address.district.id).toEqual(districtId);
      expect(address.subdistrict.id).toEqual(subdistrictId);
      expect(address).toMatchObject(rest);
    });

    it('should update isDefault to expected address and set false to others, given dto id field exist', async () => {
      const user = await createUser(app);
      const { billingAddress: defaultBillingAddress } =
        await createBillingAddress(app, user, true);
      const {
        billingAddress: secondaryBillingAddress,
        district,
        subdistrict,
        province,
      } = await createBillingAddress(app, user, false);
      const { billingAddress: thirdBillingAddress } =
        await createBillingAddress(app, user, false);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: secondaryBillingAddress.id,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
          isDefault: true,
        }),
      );

      await app.get(BillingAddressService).updateBillingAddress(dto, user);

      const [oldDefaultAddress, newDefaultAddress, unaffectedAddress] =
        await Promise.all([
          app
            .get(EntityManager)
            .getRepository(BillingAddress)
            .findOneOrFail({ id: defaultBillingAddress.id }),
          app
            .get(EntityManager)
            .getRepository(BillingAddress)
            .findOneOrFail({ id: secondaryBillingAddress.id }),
          app
            .get(EntityManager)
            .getRepository(BillingAddress)
            .findOneOrFail({ id: thirdBillingAddress.id }),
        ]);
      expect(oldDefaultAddress.isDefault).toBe(false);
      expect(newDefaultAddress.isDefault).toBe(true);
      expect(unaffectedAddress.isDefault).toBe(false);
    });

    it('should throw exception given dto id field not exist', async () => {
      const user = await createUser(app);
      const { district, subdistrict, province } = await createBillingAddress(
        app,
        user,
      );
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: undefined,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
        }),
      );

      await expect(() =>
        app.get(BillingAddressService).updateBillingAddress(dto, user),
      ).rejects.toBeDefined();
    });

    it('should throw exception given invalid districtId, subdistrictId, and provinceId', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: billingAddress.id,
          billingAddress: 'billingAddress',
          districtId: -1,
          subdistrictId: -1,
          provinceId: -1,
          country: 'country',
        }),
      );

      await expect(() =>
        app.get(BillingAddressService).updateBillingAddress(dto, user),
      ).rejects.toBeDefined();
    });

    it('should throw exception when updating billing address not owned by the same user', async () => {
      const [user1, user2] = await Promise.all([
        createUser(app),
        createUser(app),
      ]);
      const [billingAddress1, billingAddress2] = await Promise.all([
        createBillingAddress(app, user1),
        createBillingAddress(app, user2),
      ]);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: billingAddress2.billingAddress.id,
          billingAddress: 'billingAddress',
          districtId: billingAddress1.district.id,
          subdistrictId: billingAddress1.subdistrict.id,
          provinceId: billingAddress1.province.id,
          country: 'country',
        }),
      );

      await expect(() =>
        app.get(BillingAddressService).updateBillingAddress(dto, user1),
      ).rejects.toBeDefined();
    });

    it('should throw exception when updating isDefault = false, given there is one billing address exist', async () => {
      const user = await createUser(app);
      const { billingAddress, district, subdistrict, province } =
        await createBillingAddress(app, user, true);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: billingAddress.id,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
          isDefault: false,
        }),
      );

      await expect(() =>
        app.get(BillingAddressService).updateBillingAddress(dto, user),
      ).rejects.toBeDefined();
    });
  });

  describe('#createBillingAddress', () => {
    it('should create new billing address, given that there is no address exists', async () => {
      const user = await createUser(app);
      const { province, district, subdistrict } = await createAddress(app);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: undefined,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
        }),
      );

      await app.get(BillingAddressService).createBillingAddress(dto, user);

      const addresses = await app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .find();
      expect(addresses.length).toEqual(1);
      const [address] = addresses;
      const { districtId, subdistrictId, provinceId, id, ...rest } = dto;
      await app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .findOneOrFail({ id: address.id });
      expect(address.province.id).toEqual(provinceId);
      expect(address.district.id).toEqual(districtId);
      expect(address.subdistrict.id).toEqual(subdistrictId);
      expect(address.isDefault).toBe(true);
      expect(address).toMatchObject(rest);
    });

    it('should assign isDefault = true to a new address, given dto.isDefault = true and previous default billing address exist', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);
      const { province, district, subdistrict } = await createAddress(app);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: undefined,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
          isDefault: true,
        }),
      );

      const { id: savedId } = await app
        .get(BillingAddressService)
        .createBillingAddress(dto, user);

      const [oldDefaultAddress, newDefaultAddress] = await Promise.all([
        app
          .get(EntityManager)
          .getRepository(BillingAddress)
          .findOneOrFail({ id: billingAddress.id }),
        app
          .get(EntityManager)
          .getRepository(BillingAddress)
          .findOneOrFail({ id: savedId }),
      ]);
      expect(oldDefaultAddress.isDefault).toBe(false);
      expect(newDefaultAddress.isDefault).toBe(true);
    });

    it('should assign isDefault = false to a new address, given dto.isDefault = false and previous default billing address exist', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);
      const { province, district, subdistrict } = await createAddress(app);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: undefined,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
          isDefault: false,
        }),
      );

      const { id: savedId } = await app
        .get(BillingAddressService)
        .createBillingAddress(dto, user);

      const [originalAddress, newAddress] = await Promise.all([
        app
          .get(EntityManager)
          .getRepository(BillingAddress)
          .findOneOrFail({ id: billingAddress.id }),
        app
          .get(EntityManager)
          .getRepository(BillingAddress)
          .findOneOrFail({ id: savedId }),
      ]);
      expect(originalAddress.isDefault).toBe(true);
      expect(newAddress.isDefault).toBe(false);
    });

    it('should assign isDefault = false to a new address, given dto.isDefault = undefined and previous default billing address exist', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);
      const { province, district, subdistrict } = await createAddress(app);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          id: undefined,
          billingAddress: 'billingAddress',
          districtId: district.id,
          subdistrictId: subdistrict.id,
          provinceId: province.id,
          country: 'country',
          isDefault: undefined,
        }),
      );

      const { id: savedId } = await app
        .get(BillingAddressService)
        .createBillingAddress(dto, user);

      const [originalAddress, newAddress] = await Promise.all([
        app
          .get(EntityManager)
          .getRepository(BillingAddress)
          .findOneOrFail({ id: billingAddress.id }),
        app
          .get(EntityManager)
          .getRepository(BillingAddress)
          .findOneOrFail({ id: savedId }),
      ]);
      expect(originalAddress.isDefault).toBe(true);
      expect(newAddress.isDefault).toBe(false);
    });

    it('should throw exception given invalid districtId, subdistrictId, and provinceId', async () => {
      const user = await createUser(app);
      const dto = await serializeDto(
        new UpsertBillingAddressDto({
          billingAddress: 'billingAddress',
          districtId: -1,
          subdistrictId: -1,
          provinceId: -1,
          country: 'country',
        }),
      );

      await expect(() =>
        app.get(BillingAddressService).createBillingAddress(dto, user),
      ).rejects.toBeDefined();
    });
  });

  describe('#deleteBillingAddress', () => {
    it('should throw exception when deleting default billing address', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);
      billingAddress.isDefault = true;
      await billingAddress.save();
      const dto = await serializeDto(
        new DeleteBillingAddressDto({ id: billingAddress.id }),
      );

      await expect(() =>
        app.get(BillingAddressService).deleteAddress(dto, user),
      ).rejects.toBeDefined();
    });

    it('should throw exception when deleting billing address not owned by the same user', async () => {
      const [user1, user2] = await Promise.all([
        createUser(app),
        createUser(app),
      ]);
      const [billingAddress1] = await Promise.all([
        createBillingAddress(app, user1),
        createBillingAddress(app, user2),
      ]);
      const dto = await serializeDto(
        new DeleteBillingAddressDto({
          id: billingAddress1.billingAddress.id,
        }),
      );

      await expect(() =>
        app.get(BillingAddressService).deleteAddress(dto, user2),
      ).rejects.toBeDefined();
    });

    it('should delete expected address', async () => {
      const user = await createUser(app);
      const { billingAddress } = await createBillingAddress(app, user);
      billingAddress.isDefault = false;
      await billingAddress.save();
      const dto = await serializeDto(
        new DeleteBillingAddressDto({ id: billingAddress.id }),
      );

      await app.get(BillingAddressService).deleteAddress(dto, user);

      const result = await app
        .get(EntityManager)
        .getRepository(BillingAddress)
        .findOne({ id: billingAddress.id, user });
      expect(result).toBeUndefined();
    });
  });
});
