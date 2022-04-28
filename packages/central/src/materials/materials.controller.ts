import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@seaccentral/core/dist/user/User.entity';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import {
  createPresignedGet,
  deleteObjectFromS3,
} from '@seaccentral/core/dist/utils/s3';
import { MaterialType } from '@seaccentral/core/dist/material/material.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import * as s3UrlConditionBuilder from '@seaccentral/core/dist/utils/s3UrlConditionBuilder';
import { InternalMaterialsService } from './internalMaterials.service';
import { ExternalMaterialsService } from './externalMaterials.service';
import { CreateMaterialDto } from './dto/CreateMaterial.dto';
import { UploadMaterialDto } from './dto/UploadMaterial.dto';
import { UploadService } from '../upload/upload.service';
import { S3_MATERIAL_FOLDER } from '../utils/constants';
import { GetAllMaterialsQueryDto } from './dto/GetAllMaterialsQuery.dto';
import { BaseMaterialsService } from './baseMaterials.service';
import { GetMaterialDto } from './dto/GetMaterial.dto';

@Controller('v1/materials')
export class MaterialsController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly baseMaterialsService: BaseMaterialsService,
    private readonly internalMaterialsService: InternalMaterialsService,
    private readonly externalMaterialsService: ExternalMaterialsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PolicyGuard(MaterialsController.prototype.getAll))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_TRACK_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { exposeDefaultValues: true },
    }),
  )
  async getAll(@Query() query: GetAllMaterialsQueryDto) {
    const [materials, count] = await this.baseMaterialsService.findAllMaterials(
      query,
    );
    const response = new BaseResponseDto<GetMaterialDto[]>();
    response.data = materials.map((material) => new GetMaterialDto(material));
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Post()
  @UseGuards(JwtAuthGuard, PolicyGuard(MaterialsController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Req() request: Express.Request,
    @Body() dto: CreateMaterialDto,
  ) {
    const uploader = request.user as User;

    if (dto.type === MaterialType.MATERIAL_EXTERNAL) {
      const newMaterial = await this.externalMaterialsService.create(
        dto,
        uploader,
      );
      const response = new BaseResponseDto<GetMaterialDto>();
      response.data = new GetMaterialDto(newMaterial);

      return response;
    }

    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: dto.displayName,
      folder: S3_MATERIAL_FOLDER,
      expires: 300,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_MATERIAL_FOLDER),
        s3UrlConditionBuilder.maxSizeMB(30),
        s3UrlConditionBuilder.contentType(dto.mime as string),
      ),
    });

    const material = await this.internalMaterialsService.create({
      dto,
      uploader,
      key: s3PresignedUrl.fields.key,
    });
    const response = new BaseResponseDto<UploadMaterialDto>();
    response.data = new UploadMaterialDto({
      material: new GetMaterialDto(material),
      s3Params: s3PresignedUrl,
    });

    return response;
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MaterialsController.prototype.getMaterialById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT)
  async getMaterialById(
    @Req() request: Express.Request,
    @Param('id') id: string,
  ) {
    const material = await this.baseMaterialsService.findOneMaterial({
      id,
    });
    if (!material) {
      throw new NotFoundException(`material id ${id} not found`);
    }
    const response = new BaseResponseDto<GetMaterialDto>();
    response.data = new GetMaterialDto(material);

    return response;
  }

  @Post(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MaterialsController.prototype.updateById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT)
  async updateById(@Param('id') id: string, @Body() dto: CreateMaterialDto) {
    const { type, hash } = dto;

    if (type === MaterialType.MATERIAL_EXTERNAL) {
      const result = await this.externalMaterialsService.update(id, dto);
      const response = new BaseResponseDto<UpdateResult>();
      response.data = result;

      return response;
    }
    const material = await this.internalMaterialsService.findOneMaterial({
      id,
    });
    if (!material) {
      throw new NotFoundException('material not found');
    }
    const isSameFile = material.hash === hash;
    if (isSameFile) {
      const result = await this.internalMaterialsService.update(
        id,
        dto,
        material.key,
      );
      const response = new BaseResponseDto<UpdateResult>();
      response.data = result;

      return response;
    }
    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: dto.displayName,
      folder: S3_MATERIAL_FOLDER,
      expires: 300,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_MATERIAL_FOLDER),
        s3UrlConditionBuilder.maxSizeMB(30),
        s3UrlConditionBuilder.contentType(dto.mime as string),
      ),
    });
    await this.internalMaterialsService.update(
      id,
      dto,
      s3PresignedUrl.fields.key,
    );
    const response = new BaseResponseDto<UploadMaterialDto>();
    response.data = new UploadMaterialDto({
      material,
      s3Params: s3PresignedUrl,
    });

    return response;
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MaterialsController.prototype.deleteMaterialById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT)
  async deleteMaterialById(@Param('id') id: string) {
    const internalMaterial =
      await this.internalMaterialsService.findOneMaterial({ id });
    const result = await this.baseMaterialsService.deleteMaterial(id);

    if (internalMaterial) {
      await deleteObjectFromS3(internalMaterial.key);
    }

    const response = new BaseResponseDto<DeleteResult>();
    response.data = result;

    return response;
  }

  @Get(':id/download-url')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(MaterialsController.prototype.generateDownloadUrl),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_MATERIAL_MANAGEMENT)
  async generateDownloadUrl(
    @Req() request: Express.Request,
    @Param('id') id: string,
  ) {
    const material = await this.internalMaterialsService.findOneMaterial({
      id,
    });
    if (!material) {
      throw new NotFoundException(`material id ${id} not found`);
    }
    const response = new BaseResponseDto<string>();
    response.data = await createPresignedGet({
      Key: material.key,
      Expires: 60,
    });

    return response;
  }
}
