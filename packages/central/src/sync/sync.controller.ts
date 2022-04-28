import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { TransformClassToPlain } from 'class-transformer';
import { DurationInterval } from '@seaccentral/core/dist/payment/SubscriptionPlan.entity';
import { ARProductRawService } from '../webhook/ARProductRaw.service';
import { SyncAuthGuard } from '../guards/syncAuth.guard';
import { RawProductService } from '../webhook/RawProduct.service';
import { ARProductRawDto } from './dto/ARProductRaw.dto';
import { BaseStrapiResponse } from './dto/BaseStrapiResponse';

@Controller('/v1/sync')
@ApiTags('Sync')
@UseGuards(SyncAuthGuard)
export class SyncController {
  constructor(
    private readonly rawProductService: RawProductService,
    private readonly arProductRawService: ARProductRawService,
  ) {}

  @Get('/raw-products')
  @TransformClassToPlain()
  async getRawProducts(): Promise<BaseResponseDto<ARProductRawDto[]>> {
    const arProducts = await this.arProductRawService.findProduct();
    const response = new BaseResponseDto<ARProductRawDto[]>();
    response.data = arProducts;

    return response;
  }

  @Get('/subscription-plans')
  @TransformClassToPlain({ groups: ['subscriptionPlans'] })
  async getSubscriptionPlans() {
    const plans = await this.rawProductService.getSubscriptionPlans();

    return plans.map(
      (sp) =>
        new BaseStrapiResponse({
          ...sp,
          // these are for backward compatibility before we move on to period day,month,year
          durationInterval: DurationInterval.DAY,
          durationValue:
            sp.periodDay + sp.periodMonth * 30 + sp.periodYear * 360,
        }),
    );
  }
}
