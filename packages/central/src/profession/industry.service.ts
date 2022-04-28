import { InjectRepository } from '@nestjs/typeorm';
import { Industry } from '@seaccentral/core/dist/user/Industry.entity';
import { Repository } from 'typeorm';
import { IndustryDto } from './dto/Industry.dto';

export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  findAll(dto: IndustryDto) {
    const { nameEn, nameTh } = dto;
    return this.industryRepository.find({
      order: {
        nameEn,
        nameTh,
      },
    });
  }
}
