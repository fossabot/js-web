import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { Connection, DeleteResult } from 'typeorm';
import { AccountTaxInvoiceService } from './AccountTaxInvoice.service';
import { GetTaxInvoiceDto } from './dto/GetTaxInvoice.dto';
import { UpsertTaxInvoiceDto } from './dto/UpsertTaxInvoice.dto';

@Controller('v1/tax-invoices')
@ApiTags('TaxInvoice')
export class TaxInvoiceController {
  constructor(
    private readonly connection: Connection,
    private readonly accountTaxInvoiceService: AccountTaxInvoiceService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async listMyTaxInvoices(@Req() req: IRequestWithUser) {
    const taxInvoices = await this.accountTaxInvoiceService.list(req.user);
    const response = new BaseResponseDto<GetTaxInvoiceDto[]>();
    response.data = taxInvoices.map(
      (taxInvoice) => new GetTaxInvoiceDto(taxInvoice),
    );

    return response;
  }

  @Get('me/:taxId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getMyTaxInvoice(
    @Req() req: IRequestWithUser,
    @Param('taxId') taxId: string,
  ) {
    const taxInvoice = await this.accountTaxInvoiceService.findById(
      req.user,
      taxId,
    );
    const response = new BaseResponseDto<GetTaxInvoiceDto>();

    if (!taxInvoice) {
      throw new NotFoundException();
    }
    response.data = new GetTaxInvoiceDto(taxInvoice);

    return response;
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async upsertMyTaxInvoice(
    @Req() req: IRequestWithUser,
    @Body() dto: UpsertTaxInvoiceDto,
  ) {
    const taxInvoice = await this.connection.transaction((manager) =>
      this.accountTaxInvoiceService
        .withTransaction(manager)
        .upsertUserTaxInvoice(req.user, dto),
    );
    const response = new BaseResponseDto<GetTaxInvoiceDto>();
    response.data = new GetTaxInvoiceDto(taxInvoice);

    return response;
  }

  @Delete('me/:taxId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteMyTaxInvoice(
    @Req() req: IRequestWithUser,
    @Param('taxId') taxId: string,
  ) {
    const result = await this.accountTaxInvoiceService.deleteUserTaxInvoice(
      req.user,
      taxId,
    );
    const response = new BaseResponseDto<DeleteResult>();
    response.data = result;
    return response;
  }
}
