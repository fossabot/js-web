import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { ContactCorporateService } from '@seaccentral/core/dist/crm/contact.corporate.service';
import { CreateContactCorporateDto } from '@seaccentral/core/dist/dto/CreateContact.dto';
import { FindOneContactQuery } from '@seaccentral/core/dist/dto/FindOneContactQuery.dto';
import { ContactCorporate } from '@seaccentral/core/dist/crm/contact.entity';

@Controller('v1/contact/corporate')
@ApiTags('Contact')
export class ContactCorporateController {
  constructor(
    private readonly contactCorporateService: ContactCorporateService,
  ) {}

  @Post()
  create(@Body() createContactCorporateDto: CreateContactCorporateDto) {
    return this.contactCorporateService.create(createContactCorporateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const response = new BaseResponseDto<ContactCorporate[]>();
    response.data = await this.contactCorporateService.findAll();
    return response;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param() findOneContactQuery: FindOneContactQuery) {
    const response = new BaseResponseDto<ContactCorporate[]>();
    response.data = await this.contactCorporateService.findOne(
      findOneContactQuery,
    );
    return response;
  }
}
