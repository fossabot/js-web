import { Entity, Column, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { User } from './User.entity';
import { UserThirdPartyType } from './UserThirdPartyType.enum';

export interface ICRMAdditionalDetail {
  memberType: string;
  batchName: string;
  department: string;
  dealId: string;
  invoiceNumber: string;
  amendmentStatus: string;
  company: string;
  saleOrderId: string;
}

@Entity()
export class UserThirdParty extends Base {
  @Column()
  userThirdPartyId: string;

  @Column()
  userThirdPartyType: UserThirdPartyType;

  @Column({
    type: 'jsonb',
    default: null,
    nullable: true,
  })
  additionalDetail: ICRMAdditionalDetail;

  @Column()
  userId: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;
}
