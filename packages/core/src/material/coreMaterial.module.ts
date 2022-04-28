import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BaseMaterial,
  MaterialExternal,
  MaterialInternal,
} from './material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BaseMaterial,
      MaterialInternal,
      MaterialExternal,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CoreMaterialModule {}
