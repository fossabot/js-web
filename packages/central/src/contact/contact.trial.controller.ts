import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { CreateContactTrialDto } from '@seaccentral/core/dist/dto/CreateContact.dto';
import { FindOneContactQuery } from '@seaccentral/core/dist/dto/FindOneContactQuery.dto';
import { ContactTrial } from '@seaccentral/core/dist/crm/contact.entity';
import { ContactTrialService } from '@seaccentral/core/dist/crm/contact.trial.service';

@Controller('v1/contact/trial')
@ApiTags('Contact')
export class ContactTrialController {
  constructor(private readonly contactTrialService: ContactTrialService) {}

  @Post()
  create(@Body() createContactTrialDto: CreateContactTrialDto) {
    return this.contactTrialService.create(createContactTrialDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const response = new BaseResponseDto<ContactTrial[]>();
    response.data = await this.contactTrialService.findAll();
    return response;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param() findOneContactQuery: FindOneContactQuery) {
    const response = new BaseResponseDto<ContactTrial[]>();
    response.data = await this.contactTrialService.findOne(findOneContactQuery);
    return response;
  }
}
