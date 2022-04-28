import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { UserTaxInvoice } from '@seaccentral/core/dist/user/UserTaxInvoice.entity';
import { BillingAddress } from '@seaccentral/core/dist/payment/BillingAddress.entity';
import { Repository } from 'typeorm';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { OfficeType } from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { UpsertTaxInvoiceDto } from './dto/UpsertTaxInvoice.dto';

@Injectable()
export class AccountTaxInvoiceService extends TransactionFor<AccountTaxInvoiceService> {
  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(UserTaxInvoice)
    private readonly userTaxInvoiceRepository: Repository<UserTaxInvoice>,
    @InjectRepository(BillingAddress)
    private readonly billingAddressRepository: Repository<BillingAddress>,
  ) {
    super(moduleRef);
  }

  async list(user: User) {
    return this.userTaxInvoiceRepository.find({
      where: { user },
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findById(user: User, id: string) {
    return this.userTaxInvoiceRepository.findOne({ user, id });
  }

  async upsertUserTaxInvoice(user: User, dto: UpsertTaxInvoiceDto) {
    const { billingAddress } = dto;

    if (dto.id && !billingAddress) {
      const userTaxInvoice = await this.userTaxInvoiceRepository.findOne({
        relations: ['billingAddress'],
        where: {
          user,
          id: dto.id,
        },
      });

      if (userTaxInvoice?.billingAddress) {
        await this.billingAddressRepository.delete(
          userTaxInvoice.billingAddress.id,
        );
      }
    }
    if (dto.isDefault) {
      await this.userTaxInvoiceRepository.update(
        { user },
        {
          isDefault: false,
        },
      );
    }
    const nInvoices = await this.userTaxInvoiceRepository.count({ user });
    const isDefault = nInvoices <= 0 ? true : dto.isDefault;
    const userTaxInvoice = this.userTaxInvoiceRepository.create({
      id: dto.id,
      user,
      isDefault,
      taxType: dto.taxType,
      officeType: dto.officeType,
      taxEntityName: dto.taxEntityName,
      headOfficeOrBranch:
        dto.officeType === OfficeType.BRANCH
          ? dto.headOfficeOrBranch
          : (null as any),
      taxId: dto.taxId,
      taxAddress: dto.taxAddress,
      district: { id: dto.districtId },
      subdistrict: { id: dto.subdistrictId },
      province: { id: dto.provinceId },
      country: dto.country,
      zipCode: dto.zipCode,
      contactPerson: dto.contactPerson,
      contactPhoneNumber: dto.contactPhoneNumber,
      contactEmail: dto.contactEmail,
      billingAddress: billingAddress
        ? this.billingAddressRepository.create({
            id: billingAddress.id,
            billingAddress: billingAddress.billingAddress,
            district: { id: billingAddress.districtId },
            subdistrict: { id: billingAddress.subdistrictId },
            province: { id: billingAddress.provinceId },
            country: billingAddress.country,
            isDefault,
            user,
          })
        : null,
    });

    return this.userTaxInvoiceRepository.save(userTaxInvoice);
  }

  async deleteUserTaxInvoice(user: User, taxInvoiceId: string) {
    return this.userTaxInvoiceRepository.delete({ user, id: taxInvoiceId });
  }
}
