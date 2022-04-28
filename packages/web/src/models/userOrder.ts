export interface UserOrder {
  id: string;

  externalOrderId?: string;

  price: string;

  name: string;

  createdAt: Date;
}
