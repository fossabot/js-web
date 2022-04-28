import { Exclude, Expose } from 'class-transformer';

export class BaseStrapiResponse {
  @Expose({ groups: ['subscriptionPlans'] })
  id: string;

  @Expose({ groups: ['subscriptionPlans'] })
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(partial: any) {
    Object.assign(this, partial);
  }
}
