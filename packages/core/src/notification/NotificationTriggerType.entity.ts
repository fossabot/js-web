import { Column, Entity, Unique } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
@Unique('notification_trigger_type_unique', ['displayName', 'triggerSeconds'])
export class NotificationTriggerType extends Base {
  @Column({ type: 'varchar', length: 200, nullable: false })
  displayName!: string;

  @Column({ type: 'int', array: true, nullable: false, default: [] })
  triggerSeconds!: number[];
}
