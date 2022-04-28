import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subdistrict, Province, District])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
