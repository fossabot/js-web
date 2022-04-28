import { Entity, Column, OneToOne, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Organization } from '../organization/Organization.entity';
import { ServiceProviderConfig } from './ServiceProviderConfig.entity';

@Entity()
export class IdentityProviderConfig extends Base {
  @ManyToOne(() => Organization, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @OneToOne(() => ServiceProviderConfig, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  serviceProviderConfig: ServiceProviderConfig;

  @Column({ nullable: true })
  nameidFormat?: string;

  @Column({ nullable: true })
  idpLabel?: string;

  @Column({ nullable: true })
  issuer?: string;

  @Column({ nullable: true })
  ssoLoginUrl?: string;

  @Column({ nullable: true })
  ssoLogoutUrl?: string;

  @Column({ nullable: true })
  certificateKey?: string;

  @Column({ nullable: true })
  metadataKey?: string;

  @Column({ nullable: true })
  certificateFileName?: string;

  @Column({ nullable: true })
  metadataFileName?: string;

  @Column({ nullable: true })
  privateKeyKey?: string;

  @Column({ default: false })
  forceAuthn!: boolean;

  @Column({ default: false })
  isAuthnRequestsSigned!: boolean;

  @Column({ default: false })
  allowUnencryptedAssertions!: boolean;
}
