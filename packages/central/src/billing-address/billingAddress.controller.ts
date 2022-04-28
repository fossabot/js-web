import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@seaccentral/core/dist/user/User.entity';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { DeleteResult } from 'typeorm';
import { BillingAddressService } from './billingAddress.service';
import { GetBillingAddressDto } from './dto/GetBillingAddress.dto';
import { UpsertBillingAddressDto } from './dto/UpsertBillingAddress.dto';
import { DeleteBillingAddressDto } from './dto/DeleteBillingAddress.dto';

@Controller('v1/billing-address')
@ApiTags('BillingAddress')
export class BillingAddressController {
  constructor(private readonly billingAddressService: BillingAddressService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getMyBillingAddress(@Req() request: Request) {
    const user = request.user as User;

    const billingAddresses = await this.billingAddressService.getBillingAddress(
      user,
    );
    const response = new BaseResponseDto<GetBillingAddressDto[]>();
    response.data = billingAddresses.map(
      (address) => new GetBillingAddressDto(address),
    );

    return response;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async upsertMyBillingAddress(
    @Req() request: Request,
    @Body() dto: UpsertBillingAddressDto,
  ) {
    const user = request.user as User;

    const billingAddress = dto.id
      ? await this.billingAddressService.updateBillingAddress(dto, user)
      : await this.billingAddressService.createBillingAddress(dto, user);
    const response = new BaseResponseDto<GetBillingAddressDto>();
    response.data = new GetBillingAddressDto(billingAddress);

    return response;
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async deleteMyBillingAddress(
    @Req() request: Request,
    @Body() dto: DeleteBillingAddressDto,
  ) {
    const user = request.user as User;

    const deleteResult = await this.billingAddressService.deleteAddress(
      dto,
      user,
    );

    const response = new BaseResponseDto<DeleteResult>();
    response.data = deleteResult;

    return response;
  }
}
