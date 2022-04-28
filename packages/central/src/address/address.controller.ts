import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Subdistrict } from '@seaccentral/core/dist/address/Subdistrict.entity';
import { District } from '@seaccentral/core/dist/address/District.entity';
import { Province } from '@seaccentral/core/dist/address/Province.entity';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { AddressService } from './address.service';
import { GetZipcodeQueryDTO } from './dto/GetZipcode.dto';
import { GetDistrictQueryDTO } from './dto/GetDistrictQuery.dto';
import { GetProvinceQueryDTO } from './dto/GetProvinceQuery.dto';
import { GetSubdistrictQueryDTO } from './dto/GetSubdistrictQuery.dto';

@Controller('v1/address')
@ApiTags('Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('subdistrict')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSubdistricts(@Query() query: GetSubdistrictQueryDTO) {
    const response = new BaseResponseDto<Partial<Subdistrict[]>>();
    response.data = await this.addressService.getSubdistricts(query);

    return response;
  }

  @Get('district')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDistricts(@Query() query: GetDistrictQueryDTO) {
    const response = new BaseResponseDto<Partial<District[]>>();
    response.data = await this.addressService.getDistricts(query);

    return response;
  }

  @Get('province')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getProvinces(@Query() query: GetProvinceQueryDTO) {
    const response = new BaseResponseDto<Partial<Province[]>>();
    response.data = await this.addressService.getProvinces(query);

    return response;
  }

  @Get('zipcode')
  async getZipcodes(@Query() query: GetZipcodeQueryDTO) {
    const response = new BaseResponseDto<Partial<Subdistrict[]>>();
    response.data = await this.addressService.getZipcodes(query);

    return response;
  }
}
