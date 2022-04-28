export interface ICurrencyMap {
  [key: string]: string;
}

export enum CURRENCY {
  THB = '764',
  SGD = '702',
  MYR = '456',
}

export const currencyMap: ICurrencyMap = {
  THB: '764',
  SGD: '702',
  MYR: '456',
};
