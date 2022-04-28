import { Module } from '@nestjs/common';
import { QueryStreamingService } from './queryStreaming.service';

@Module({
  providers: [QueryStreamingService],
  exports: [QueryStreamingService],
})
export class QueryStreamingModule {}
