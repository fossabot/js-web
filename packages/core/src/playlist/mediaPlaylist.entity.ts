import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../base/Base.entity';
import { Media } from '../media/media.entity';
import { Playlist } from './playlist.entity';

@Entity()
export class MediaPlaylist extends Base {
  @ManyToOne(() => Playlist)
  playlist: Playlist;

  @ManyToOne(() => Media, { eager: true })
  media: Media;

  @Column()
  sequence: number;
}
