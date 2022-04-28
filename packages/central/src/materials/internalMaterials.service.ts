import { MaterialInternal } from '@seaccentral/core/dist/material/material.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { defaultTo } from 'lodash';
import { CreateMaterialDto } from './dto/CreateMaterial.dto';
import { GetAllMaterialsQueryDto } from './dto/GetAllMaterialsQuery.dto';

export class InternalMaterialsService {
  constructor(
    @InjectRepository(MaterialInternal)
    private readonly materialInternalRepository: Repository<MaterialInternal>,
  ) {}

  async create(params: {
    dto: CreateMaterialDto;
    uploader: User;
    key: string;
  }) {
    const { dto, uploader, key } = params;

    const newMaterial = this.materialInternalRepository.create({
      displayName: dto.displayName,
      language: defaultTo(dto.language, null),
      uploader,
      mime: dto.mime,
      filename: dto.filename,
      bytes: dto.bytes,
      hash: dto.hash,
      key,
    });

    return this.materialInternalRepository.save(newMaterial);
  }

  async update(id: string, dto: CreateMaterialDto, key: string) {
    const { hash, displayName, language, mime, bytes, filename } = dto;

    const result = await this.materialInternalRepository.update(
      { id },
      {
        displayName,
        language,
        hash,
        mime,
        filename,
        bytes,
        key,
      },
    );

    return result;
  }

  async findOneMaterial(conditions?: Partial<MaterialInternal>) {
    const material = await this.materialInternalRepository.findOne(conditions);

    return material;
  }

  async findAllMaterial(dto: GetAllMaterialsQueryDto) {
    const orderByField = dto.orderBy ? { [dto.orderBy]: dto.order } : {};
    const materials = await this.materialInternalRepository.find({
      take: dto.take,
      skip: dto.skip,
      order: {
        ...orderByField,
      },
    });

    return materials;
  }
}
