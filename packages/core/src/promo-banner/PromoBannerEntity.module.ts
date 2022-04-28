import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoBanner } from './PromoBanner.entity';
import { Language } from '../language/Language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromoBanner, Language])],
  exports: [TypeOrmModule],
})
export class PromoBannerEntityModule {}
