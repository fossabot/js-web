import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { ContactRetailService } from '@seaccentral/core/dist/crm/contact.retail.service';
import { CreateContactRetailDto } from '@seaccentral/core/dist/dto/CreateContact.dto';
import { FindOneContactQuery } from '@seaccentral/core/dist/dto/FindOneContactQuery.dto';
import { ContactRetail } from '@seaccentral/core/dist/crm/contact.entity';

@Controller('v1/contact/retail')
@ApiTags('Contact')
export class ContactRetailController {
  constructor(private readonly contactRetailService: ContactRetailService) {}

  @Post()
  create(@Body() createContactRetailDto: CreateContactRetailDto) {
    return this.contactRetailService.create(createContactRetailDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const response = new BaseResponseDto<ContactRetail[]>();
    response.data = await this.contactRetailService.findAll();
    return response;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param() findOneContactQuery: FindOneContactQuery) {
    const response = new BaseResponseDto<ContactRetail[]>();
    response.data = await this.contactRetailService.findOne(
      findOneContactQuery,
    );
    return response;
  }
}
