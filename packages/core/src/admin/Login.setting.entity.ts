import { Entity, Column } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
export class LoginSetting extends Base {
  @Column()
  maxAttempts: number;

  @Column()
  lockDuration: number;
}
