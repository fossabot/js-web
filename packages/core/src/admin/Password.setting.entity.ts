import { Entity, Column } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
export class PasswordSetting extends Base {
  @Column()
  expireIn: number;

  @Column()
  notifyIn: number;
}
