import { CouponDetailArRaw } from '@seaccentral/core/dist/raw-product/CouponDetailArRaw.entity';

export class CartTotalDto {
  subTotal: string;

  discount?: string | null;

  vat: string;

  vatRate: string;

  grandTotal: string;
}
