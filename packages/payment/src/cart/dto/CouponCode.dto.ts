import { IsNotEmpty, IsString } from 'class-validator';

export class CouponCodeDto {
  @IsString()
  planId: string;

  @IsString()
  @IsNotEmpty()
  couponCode: string;
}
