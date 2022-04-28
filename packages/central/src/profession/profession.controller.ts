import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BaseResponseDto } from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { CompanySizeRange } from '@seaccentral/core/dist/user/Range.entity';
import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { CompanySizeRangeService } from './companySizeRange.service';
import { CompanySizeRangeDto } from './dto/CompanySizeRange.dto';
import { IndustryDto } from './dto/Industry.dto';
import { IndustryService } from './industry.service';

@Controller('v1/profession')
export class ProfessionController {
  constructor(
    private readonly companySizeRangeService: CompanySizeRangeService,
    private readonly industryService: IndustryService,
  ) {}

  @Get('companySizeRanges')
  @UseGuards(JwtAuthGuard)
  async getCompanySizeRange(@Query() dto: CompanySizeRangeDto) {
    const ranges = await this.companySizeRangeService.findAll(dto);
    const response = new BaseResponseDto<CompanySizeRange[]>();
    response.data = ranges;

    return response;
  }

  @Get('industries')
  @UseGuards(JwtAuthGuard)
  async getIndustries(@Query() dto: IndustryDto) {
    const industries = await this.industryService.findAll(dto);
    const response = new BaseResponseDto<Industry[]>();
    response.data = industries;

    return response;
  }
}
