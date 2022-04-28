// https://oozouhq.atlassian.net/browse/SEAC-888?focusedCommentId=60474

export interface RedeemCouponApiRequest {
  CouponCode: string;
  CouponUniqueNo: string;
  Quantity: number;
  Salesperson?: string;
  CustomerCode?: string;
  CustomerName?: string;
  DealID: string;
  QuotationNo?: string;
}

export interface RedeemCouponApiResponse {
  code: string;
  message: string;
}
