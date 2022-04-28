import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreMediaModule } from '../media/coreMedia.module';
import { MediaPlaylist } from './mediaPlaylist.entity';
import { Playlist } from './playlist.entity';

@Module({
  imports: [
    CoreMediaModule,
    TypeOrmModule.forFeature([Playlist, MediaPlaylist]),
  ],
  exports: [TypeOrmModule],
})
export class CorePlaylistModule {}
