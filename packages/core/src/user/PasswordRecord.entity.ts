import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { UserAuthProvider } from './UserAuthProvider.entity';

@Entity()
export class PasswordRecord extends Base {
  @Column()
  hashedPassword: string;

  @ManyToOne(() => UserAuthProvider, { onDelete: 'CASCADE' })
  userAuthProvider: UserAuthProvider;
}
