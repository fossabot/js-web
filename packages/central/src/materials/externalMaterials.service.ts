import { Injectable } from '@nestjs/common';
import { MaterialExternal } from '@seaccentral/core/dist/material/material.entity';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { defaultTo } from 'lodash';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMaterialDto } from './dto/CreateMaterial.dto';
import { GetAllMaterialsQueryDto } from './dto/GetAllMaterialsQuery.dto';

@Injectable()
export class ExternalMaterialsService {
  constructor(
    @InjectRepository(MaterialExternal)
    private readonly materialExternalRepository: Repository<MaterialExternal>,
  ) {}

  async create(dto: CreateMaterialDto, user: User) {
    const newMaterial = this.materialExternalRepository.create({
      displayName: defaultTo(dto.displayName, dto.url),
      language: dto.language,
      uploader: user,
      url: dto.url,
    });

    return this.materialExternalRepository.save(newMaterial);
  }

  async update(id: string, dto: CreateMaterialDto) {
    const result = await this.materialExternalRepository.update(
      { id },
      {
        displayName: dto.displayName,
        language: dto.language,
        url: dto.url,
      },
    );

    return result;
  }

  async findAllMaterial(dto: GetAllMaterialsQueryDto) {
    const orderByField = dto.orderBy ? { [dto.orderBy]: dto.order } : {};
    const materials = await this.materialExternalRepository.find({
      take: dto.take,
      skip: dto.skip,
      order: {
        ...orderByField,
      },
    });

    return materials;
  }
}
