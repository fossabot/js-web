import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserSearchHistory } from './UserSearchHistory.entity';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_HOST') as string,
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME') as string,
          password: configService.get('ELASTICSEARCH_PASSWORD') as string,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserSearchHistory]),
  ],
  exports: [ElasticsearchModule, TypeOrmModule],
})
export class SearchModule {}
