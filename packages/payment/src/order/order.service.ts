import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BACKEND_ADMIN_CONTROL,
  GOD_MODE,
} from '@seaccentral/core/dist/access-control/constants';
import { UserPolicies } from '@seaccentral/core/dist/access-control/policy.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { getPaginationRequestParams } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import {
  Order,
  OrderStatus,
} from '@seaccentral/core/dist/payment/Order.entity';
import { TaxInvoice } from '@seaccentral/core/dist/payment/TaxInvoice.entity';
import { Transaction } from '@seaccentral/core/dist/payment/Transaction.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(TaxInvoice)
    private taxInvoiceRepository: Repository<TaxInvoice>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getOrderById({
    id,
    user,
    userPolicies,
  }: {
    id: string;
    user: User;
  } & UserPolicies) {
    const order = await this.orderRepository.findOne({
      where: { id, isActive: true },
    });

    if (
      !order ||
      // allow people with user mng access to allow getting other user's order details
      (order.userId !== user.id &&
        !userPolicies.has(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT) &&
        !userPolicies.has(GOD_MODE.GRANT_ALL_ACCESS))
    )
      throw new NotFoundException();

    return order;
  }

  getTaxInvoiceByOrderId(orderId: string) {
    return this.taxInvoiceRepository.findOne({
      select: [
        'id',
        'taxAddress',
        'taxEntityName',
        'subdistrict',
        'district',
        'province',
        'country',
        'zipCode',
        'taxId',
        'updatedAt',
        'contactPerson',
        'contactEmail',
        'contactPhoneNumber',
        'billingAddress',
      ],
      where: { isActive: true, orderId },
      relations: ['district', 'subdistrict', 'province', 'billingAddress'],
    });
  }

  getTransactionByOrderId(orderId: string) {
    return this.transactionRepository.findOne({
      select: ['id', 'metaData', 'createdAt'],
      where: { isActive: true, orderId },
    });
  }

  async getUserOrders(dto: BaseQueryDto, userId: User['id']) {
    const { skip, take } = getPaginationRequestParams(dto);

    return this.orderRepository.findAndCount({
      where: { userId, status: OrderStatus.COMPLETED },
      relations: ['transaction'],
      take,
      skip,
      order: { createdAt: 'DESC' },
    });
  }
}
