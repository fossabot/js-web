import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import {
  PolicyGuard,
  UserPolicies,
} from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import IRequestWithUser from '../index/interface/IRequestWithUser.interface';
import { GetUserOrdersQueryDto } from './dto/GetUserOrdersQuery.dto';
import { OrderPaymentResponse } from './dto/OrderPaymentResponse.dto';
import { UserOrderResponse } from './dto/UserOrderResponse.dto';
import { OrderService } from './order.service';

@Controller('v1/order')
@ApiTags('order')
@UseInterceptors(ClassSerializerInterceptor)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get(':id/payment')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrderController.prototype.getOrderPaymentById),
  )
  @Policy()
  async getOrderPaymentById(
    @Param('id') id: string,
    @Req() req: IRequestWithUser & UserPolicies,
  ) {
    const { user, userPolicies } = req;
    const order = await this.orderService.getOrderById({
      id,
      user,
      userPolicies,
    });
    const data = new OrderPaymentResponse(order);
    data.taxInvoice = await this.orderService.getTaxInvoiceByOrderId(id);
    data.transaction = await this.orderService.getTransactionByOrderId(id);

    const response = new BaseResponseDto<OrderPaymentResponse>();
    response.data = data;

    return response;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getSelfOrders(
    @Query() dto: BaseQueryDto,
    @Req() req: IRequestWithUser,
  ) {
    const [orders, count] = await this.orderService.getUserOrders(
      dto,
      req.user.id,
    );

    const response = new BaseResponseDto();
    response.data = orders.map((order) => new UserOrderResponse(order));
    response.pagination = getPaginationResponseParams(dto, count);

    return response;
  }

  @Get('user')
  @UseGuards(JwtAuthGuard, PolicyGuard(OrderController.prototype.getUserOrders))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  async getUserOrders(@Query() dto: GetUserOrdersQueryDto) {
    const [orders, count] = await this.orderService.getUserOrders(
      dto,
      dto.userId,
    );

    const response = new BaseResponseDto();
    response.data = orders.map((order) => new UserOrderResponse(order));
    response.pagination = getPaginationResponseParams(dto, count);

    return response;
  }
}
