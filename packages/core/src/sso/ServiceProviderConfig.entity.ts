import { Entity, Column, ManyToOne } from 'typeorm';

import { Base } from '../base/Base.entity';
import { Organization } from '../organization/Organization.entity';

@Entity()
export class ServiceProviderConfig extends Base {
  @ManyToOne(() => Organization, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @Column({ nullable: true })
  metadataKey?: string;

  @Column({ nullable: true })
  certificateKey?: string;

  @Column({ nullable: true })
  certificateFileName?: string;

  @Column({ nullable: true })
  metadataFileName?: string;

  @Column({ nullable: true })
  privateKeyKey?: string;

  @Column({ default: false })
  forceAuthn!: boolean;

  @Column({ default: false })
  wantAssertionsSigned!: boolean;

  @Column({ default: false })
  isAuthnRequestsSigned!: boolean;

  @Column({ default: false })
  allowUnencryptedAssertions!: boolean;

  @Column({ nullable: true })
  issuer?: string;

  @Column({ nullable: true })
  callbackUrl?: string;
}
