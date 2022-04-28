import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { User } from '../user/User.entity';

@Entity()
export class Playlist extends Base {
  @Column()
  jwPlaylistId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => User)
  author: User;
}
