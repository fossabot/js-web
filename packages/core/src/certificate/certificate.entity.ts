import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  TableInheritance,
} from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';
import {
  CertificationOrientation,
  CertificationType,
} from './certificate.enum';
import { UserCertificate } from './UserCertificate.entity';

@Entity('certificate')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Certificate extends Base {
  @Column()
  orientation: CertificationOrientation;

  @Column({ enum: CertificationType, nullable: true, default: null })
  certType?: CertificationType;

  @Column()
  title: string;

  @Column()
  mime: string;

  @Column()
  filename: string;

  @Column()
  key: string;

  @Column()
  bytes: number;

  @Column()
  hash: string;

  @Column({ default: 'SEAC' })
  provider: string;

  @ManyToOne(() => User, { eager: true })
  uploader: User;

  @OneToMany(
    () => UserCertificate,
    (userCertificate) => userCertificate.certificate,
    { cascade: true },
  )
  userCertificate: UserCertificate[];
}
