import { Entity, Column, Index, ManyToOne } from 'typeorm';

import { User } from './User.entity';
import { Base } from '../base/Base.entity';
import {
  AuthProviderType,
  AuthProviderValues,
} from './UserAuthProvider.entity';

@Entity()
export class UserSession extends Base {
  @Column({ type: 'enum', enum: AuthProviderValues, nullable: false })
  provider: AuthProviderType;

  @Column({ nullable: false, unique: true })
  @Index('refreshToken_unique_index', { unique: true })
  refreshToken: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;
}
