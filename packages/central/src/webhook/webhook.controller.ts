import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { NotificationProducer } from '@seaccentral/core/dist/queue/notification.producer';
import { UserTaxInvoice } from '@seaccentral/core/dist/user/UserTaxInvoice.entity';
import { Response } from 'express';
import * as csv from 'fast-csv';
import { Connection, ObjectLiteral, UpdateResult } from 'typeorm';
import { ARAuthGuard } from '../guards/arAuth.guard';
import { CRMAuthGuard } from '../guards/crmAuth.guard';
import { ARCouponRawService } from './ARCouponRaw.service';
import { AREligibleSkuRawService } from './AREligibleSkuRaw.service';
import { ARProductRawService } from './ARProductRaw.service';
import {
  ARCouponDetailDto,
  ARCouponDetailRequest,
} from './dto/ARCouponDetailRequest.dto';
import {
  ARCouponMasterDto,
  ARCouponMasterRequest,
} from './dto/ARCouponMasterRequest.dto';
import {
  AREligibleSkuDto,
  AREligibleSkuRequest,
} from './dto/AREligibleSkuRequest.dto';
import {
  ARProductDto,
  ARProductWrapperRequest,
} from './dto/ARProductRequest.dto';
import { MemberResponseDto } from './dto/MemberResponse.dto';
import { NewMemberDto } from './dto/NewMember.dto';
import { UpdateMemberDto } from './dto/UpdateMember.dto';
import { UpdateProfileDto } from './dto/UpdateProfile.dto';
import { UpdateTaxInvoiceDto } from './dto/UpdateTaxInvoice.dto';
import { MemberService } from './member.service';
import { RecordDupeMergePipe } from './recordDupeMerge.pipe';

@Controller('v1/webhook')
@ApiTags('Webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly connection: Connection,
    private readonly memberService: MemberService,
    private readonly arProductRawService: ARProductRawService,
    private readonly arCouponRawService: ARCouponRawService,
    private readonly arEligibleSkuRawService: AREligibleSkuRawService,
  ) {}

  @UseGuards(CRMAuthGuard)
  @Post('/crm/member')
  async newMember(@Body() newMemberDto: NewMemberDto) {
    try {
      const res = await this.connection.transaction(async (manager) => {
        let response = new MemberResponseDto();
        response = await this.memberService
          .withTransaction(manager, { excluded: [NotificationProducer] })
          .create(newMemberDto);
        return response;
      });
      return res;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  @UseGuards(CRMAuthGuard)
  @Put('/crm/member')
  async updateMember(@Body() updateMemberDto: UpdateMemberDto) {
    return this.connection.transaction(async (manager) => {
      try {
        let response = new MemberResponseDto();
        response = await this.memberService
          .withTransaction(manager)
          .update(updateMemberDto);
        return response;
      } catch (error) {
        throw new HttpException(error.response, error.status);
      }
    });
  }

  @UseGuards(CRMAuthGuard)
  @Put('/crm/profile/:seacId')
  async updateProfile(
    @Param('seacId') seacId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const response = new BaseResponseDto<UpdateResult>();
    response.data = await this.memberService.updateProfile(
      seacId,
      updateProfileDto,
    );

    return response;
  }

  @UseGuards(CRMAuthGuard)
  @Post('/crm/tax-invoice/:seacId')
  async updateUserTaxInvoice(
    @Param('seacId') seacId: string,
    @Body() updateTaxInvoiceDto: UpdateTaxInvoiceDto,
  ) {
    try {
      const response = new BaseResponseDto<Partial<UserTaxInvoice>>();
      response.data = await this.memberService.updateUserTaxInvoice(
        seacId,
        updateTaxInvoiceDto,
      );

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        this.getARV2FailureResponse(error),
      );
    }
  }

  @UseGuards(ARAuthGuard)
  @Post('/ar/product')
  @UsePipes(new RecordDupeMergePipe((record: ARProductDto) => record.No))
  async product(@Body() arProductsDto: ARProductWrapperRequest) {
    try {
      const result = await this.arProductRawService.saveProducts(
        arProductsDto.records,
      );
      const response = new BaseResponseDto<ObjectLiteral[]>();
      response.data = result.identifiers;

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        this.getARV2FailureResponse(error),
      );
    }
  }

  @UseGuards(ARAuthGuard)
  @Get('/ar/product')
  async productCsv(@Res() res: Response) {
    const products = await this.arProductRawService.findProduct();
    const csvstream = csv.format({ headers: true });
    products.forEach((product) => csvstream.write(product));
    csvstream.end();

    const filename = 'ar-proudct.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return csvstream.pipe(res);
  }

  @UseGuards(ARAuthGuard)
  @Post('/ar/couponmaster')
  @UsePipes(
    new ValidationPipe({ transform: true }),
    new RecordDupeMergePipe((record: ARCouponMasterDto) => record.Coupon_Code),
  )
  async couponMaster(@Body() arCouponMasterDto: ARCouponMasterRequest) {
    try {
      const result = await this.arCouponRawService.saveCouponMasters(
        arCouponMasterDto.records,
      );
      const response = new BaseResponseDto<ObjectLiteral[]>();
      response.data = result.identifiers;

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        this.getARV2FailureResponse(error),
      );
    }
  }

  @UseGuards(ARAuthGuard)
  @Get('/ar/couponmaster')
  async couponMasterCsv(@Res() res: Response) {
    const coupons = await this.arCouponRawService.findCouponMaster();
    const csvstream = csv.format({ headers: true });
    coupons.forEach((coupon) => csvstream.write(coupon));
    csvstream.end();

    const filename = 'ar-coupon-master.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return csvstream.pipe(res);
  }

  @UseGuards(ARAuthGuard)
  @Post('/ar/coupondetail')
  @UsePipes(
    new ValidationPipe({ transform: true }),
    new RecordDupeMergePipe(
      (record: ARCouponDetailDto) => record.Coupon_Unique_No,
    ),
  )
  async couponDetail(@Body() arCouponDetailDto: ARCouponDetailRequest) {
    try {
      const result = await this.arCouponRawService.saveCouponDetail(
        arCouponDetailDto.records,
      );
      const response = new BaseResponseDto<ObjectLiteral[]>();
      response.data = result.identifiers;

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        this.getARV2FailureResponse(error),
      );
    }
  }

  @UseGuards(ARAuthGuard)
  @Get('/ar/coupondetail')
  async couponDetailCsv(@Res() res: Response) {
    const coupons = await this.arCouponRawService.findCouponDetail();
    const csvstream = csv.format({ headers: true });
    coupons.forEach((coupon) => csvstream.write(coupon));
    csvstream.end();

    const filename = 'ar-coupon-detail.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return csvstream.pipe(res);
  }

  @UseGuards(ARAuthGuard)
  @Post('/ar/eligibleskucode')
  @UsePipes(
    new ValidationPipe({ transform: true }),
    new RecordDupeMergePipe(
      (record: AREligibleSkuDto) =>
        `${record.Coupon_Code}-${record.Coupon_Code}`,
    ),
  )
  async eligibleSku(@Body() arEligibleSkuDto: AREligibleSkuRequest) {
    try {
      const result = await this.arEligibleSkuRawService.saveEligibleSku(
        arEligibleSkuDto.records,
      );
      const response = new BaseResponseDto<ObjectLiteral[]>();
      response.data = result.identifiers;

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        this.getARV2FailureResponse(error),
      );
    }
  }

  @UseGuards(ARAuthGuard)
  @Get('/ar/eligibleskucode')
  async eligibleSkuCsv(@Res() res: Response) {
    const skus = await this.arEligibleSkuRawService.findEligiblesku();
    const csvstream = csv.format({ headers: true });
    skus.forEach((sku) => csvstream.write(sku));
    csvstream.end();

    const filename = 'ar-eligible-sku.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return csvstream.pipe(res);
  }

  private getARV2FailureResponse(error: any) {
    return {
      error: {
        message: error?.message,
        detail: error?.detail,
        table: error?.table,
      },
    };
  }
}
