import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District } from './District.entity';
import { Province } from './Province.entity';
import { Subdistrict } from './Subdistrict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([District, Province, Subdistrict])],
  exports: [TypeOrmModule],
})
export class CoreAddressModule {}
