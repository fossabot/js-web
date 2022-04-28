import { Injectable } from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import { UpsertBillingAddressDto } from './dto/UpsertBillingAddress.dto';
import { DeleteBillingAddressDto } from './dto/DeleteBillingAddress.dto';

@Injectable()
export class BillingAddressService {
  constructor(
    @InjectRepository(BillingAddress)
    private readonly billingAddressRepository: Repository<BillingAddress>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Subdistrict)
    private readonly subdistrictRepository: Repository<Subdistrict>,
  ) {}

  async getBillingAddress(user: User) {
    return this.billingAddressRepository.find({ user });
  }

  async updateBillingAddress(dto: UpsertBillingAddressDto, user: User) {
    const { id, provinceId, districtId, subdistrictId, isDefault, ...rest } =
      dto;

    const [province, district, subdistrict] = await Promise.all([
      this.provinceRepository.findOneOrFail({ id: provinceId }),
      this.districtRepository.findOneOrFail({ id: districtId }),
      this.subdistrictRepository.findOneOrFail({ id: subdistrictId }),
    ]);

    if (isDefault === true) {
      await this.billingAddressRepository.update(
        { user },
        { isDefault: false },
      );
    }
    const userAddresses = await this.billingAddressRepository.find({ user });
    if (userAddresses.length === 1 && isDefault === false) {
      throw new Error(
        'Setting default address to false is not allowed when there is only one address',
      );
    }

    const billingAddress = await this.billingAddressRepository.findOneOrFail({
      id,
      user,
    });
    billingAddress.province = province;
    billingAddress.district = district;
    billingAddress.subdistrict = subdistrict;
    billingAddress.isDefault = isDefault || userAddresses.length <= 0;

    const updatedBillingAddr = Object.assign(
      billingAddress,
      rest,
    ) as BillingAddress;
    return this.billingAddressRepository.save(updatedBillingAddr);
  }

  async createBillingAddress(dto: UpsertBillingAddressDto, user: User) {
    const { provinceId, districtId, subdistrictId, isDefault, ...rest } = dto;

    const [province, district, subdistrict] = await Promise.all([
      this.provinceRepository.findOneOrFail({ id: provinceId }),
      this.districtRepository.findOneOrFail({ id: districtId }),
      this.subdistrictRepository.findOneOrFail({ id: subdistrictId }),
    ]);

    if (isDefault === true) {
      await this.billingAddressRepository.update(
        { user },
        { isDefault: false },
      );
    }

    const userAddresses = await this.billingAddressRepository.find({ user });
    const billingAddress = this.billingAddressRepository.create({
      province,
      district,
      subdistrict,
      isDefault: isDefault || userAddresses.length <= 0,
      user,
      ...rest,
    });

    return this.billingAddressRepository.save(billingAddress);
  }

  async deleteAddress(dto: DeleteBillingAddressDto, user: User) {
    const { id } = dto;

    const address = await this.billingAddressRepository.findOneOrFail({
      id,
      user,
    });
    if (address.isDefault) {
      throw new Error('Removing default address is not allowed');
    }
    return this.billingAddressRepository.delete({ id, user });
  }
}
