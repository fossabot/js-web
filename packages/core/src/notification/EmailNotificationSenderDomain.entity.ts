import { Column, Entity } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
export class EmailNotificationSenderDomain extends Base {
  @Column({ type: 'varchar', length: 200, nullable: true })
  domain?: string | null;
}
