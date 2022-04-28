import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from './User.entity';
import { Base } from '../base/Base.entity';
import { PasswordRecord } from './PasswordRecord.entity';
import { Organization } from '../organization/Organization.entity';

export enum ExternalAuthProviderType {
  Facebook = 'facebook',
  Google = 'google',
  Github = 'github',
  LinkedIn = 'linkedIn',
  SAMLSSO = 'samlSSO',
}

export type AuthProviderType = ExternalAuthProviderType | 'password';

export const AuthProviderValues = [
  'facebook',
  'google',
  'github',
  'password',
  'linkedIn',
  'samlSSO',
]; // should match strategy naming convention (in lowercase)

@Entity()
@Index(['userId', 'provider'], { unique: true })
@Index('external_user_provider_index', ['externalUserId', 'provider'], {
  unique: true,
  where: 'provider != \'password\' AND "externalUserId" IS NOT NULL',
})
export class UserAuthProvider extends Base {
  @Column({ type: 'enum', enum: AuthProviderValues })
  provider!: AuthProviderType;

  @Column({ type: 'uuid', nullable: true })
  correlationKey?: string;

  @Column({ nullable: true })
  accessToken?: string;

  @OneToMany(
    () => PasswordRecord,
    (passwordRecord) => passwordRecord.userAuthProvider,
    {
      nullable: true,
    },
  )
  passwordRecords?: PasswordRecord[];

  @Column({ nullable: true })
  hashedPassword?: string;

  @Column({ nullable: true })
  passwordExpireDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  passwordExpiryNotificationSentAt?: Date | null;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  externalUserId?: string;

  @Column({ nullable: true })
  correlationKeyDate?: Date;

  @Column()
  userId?: string;

  @ManyToOne(() => User, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @OneToOne(() => Organization, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  organization!: Organization;
}
