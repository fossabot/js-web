import { Column, Entity } from 'typeorm';
import { Base } from '../base/Base.entity';

@Entity()
export class Policy extends Base {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;
}
