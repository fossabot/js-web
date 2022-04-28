export interface ICartTotal {
  subTotal: string;

  discount?: string | null;

  vat: string;

  vatRate: string;

  grandTotal: string;
}
