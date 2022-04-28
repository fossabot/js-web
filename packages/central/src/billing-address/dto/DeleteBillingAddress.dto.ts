import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteBillingAddressDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  constructor(partial: Partial<DeleteBillingAddressDto>) {
    Object.assign(this, partial);
  }
}
