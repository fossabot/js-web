import { BaseMaterial } from '@seaccentral/core/dist/material/material.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetAllMaterialsQueryDto } from './dto/GetAllMaterialsQuery.dto';

export class BaseMaterialsService {
  constructor(
    @InjectRepository(BaseMaterial)
    private readonly baseMaterialRepository: Repository<BaseMaterial>,
  ) {}

  async findOneMaterial(conditions?: Partial<BaseMaterial>) {
    const material = await this.baseMaterialRepository.findOne(conditions);

    return material;
  }

  async findAllMaterials(dto: GetAllMaterialsQueryDto) {
    const type = dto.type ? { type: dto.type } : {};
    const searchField = dto.searchField
      ? { [dto.searchField]: ILike(`%${dto.search}%`) }
      : {};
    const orderByField = dto.orderBy ? { [dto.orderBy]: dto.order } : {};
    const materials = await this.baseMaterialRepository.findAndCount({
      where: {
        ...type,
        ...searchField,
      },
      take: dto.take,
      skip: dto.skip,
      order: {
        ...orderByField,
      },
    });

    return materials;
  }

  async deleteMaterial(id: string) {
    const result = await this.baseMaterialRepository.delete({ id });

    return result;
  }
}
