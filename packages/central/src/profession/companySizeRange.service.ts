import { InjectRepository } from '@nestjs/typeorm';
import { CompanySizeRange } from '@seaccentral/core/dist/user/Range.entity';
import { Repository } from 'typeorm';
import { CompanySizeRangeDto } from './dto/CompanySizeRange.dto';

export class CompanySizeRangeService {
  constructor(
    @InjectRepository(CompanySizeRange)
    private readonly companySizeRangeRepository: Repository<CompanySizeRange>,
  ) {}

  findAll(dto: CompanySizeRangeDto) {
    const { start, end } = dto;

    return this.companySizeRangeRepository.find({
      order: {
        start,
        end,
      },
    });
  }
}
