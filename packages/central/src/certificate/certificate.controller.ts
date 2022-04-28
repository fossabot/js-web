import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiExtraModels, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { Certificate } from '@seaccentral/core/dist/certificate/certificate.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationResponseParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { createPresignedGet } from '@seaccentral/core/dist/utils/s3';
import { DeleteResult, UpdateResult } from 'typeorm';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/CreateCertificate.dto';
import { GetCertificateDto } from './dto/GetCertificate.dto';
import { GetUserCertificateDto } from './dto/GetUserCertificate.dto';
import { UploadCertificateDto } from './dto/UploadCertificate.dto';

@ApiSecurity('auth_token')
@ApiTags('Certificates')
@Controller('v1/certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateController.prototype.getAllCertificates),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { exposeDefaultValues: true },
    }),
  )
  @ApiBaseResponse(GetCertificateDto, { pagination: true })
  @ApiExtraModels(Certificate)
  async getAllCertificates(@Query() query: BaseQueryDto) {
    const [certificates, count] =
      await this.certificateService.findAllCertificates(query);
    const response = new BaseResponseDto<GetCertificateDto[]>();
    response.data = certificates.map(
      (certificate) => new GetCertificateDto(certificate),
    );
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { exposeDefaultValues: true },
    }),
  )
  @ApiBaseResponse(GetUserCertificateDto, { pagination: true })
  @ApiExtraModels(Certificate)
  async getUserCertificates(@Req() req: IRequestWithUser) {
    const userCertificates = await this.certificateService.findUserCertificates(
      {
        user: req.user,
      },
    );

    const response = new BaseResponseDto<GetUserCertificateDto[]>();
    response.data = userCertificates.map(
      (userCertificate) => new GetUserCertificateDto(userCertificate),
    );

    return response;
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateController.prototype.getCertificateById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { exposeDefaultValues: true },
    }),
  )
  @ApiBaseResponse(GetCertificateDto)
  @ApiExtraModels(Certificate)
  async getCertificateById(@Param('id') id: string) {
    const certificate = await this.certificateService.findOneCertificate({
      id,
    });

    const response = new BaseResponseDto<GetCertificateDto>();

    response.data = new GetCertificateDto(certificate);

    return response;
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateController.prototype.createCertificate),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBaseResponse(UploadCertificateDto)
  async createCertificate(
    @Req() request: IRequestWithUser,
    @Body() dto: CreateCertificateDto,
  ) {
    const { certificate, s3PresignedUrl } =
      await this.certificateService.createCertificate({
        dto,
        uploader: request.user,
      });

    const response = new BaseResponseDto<UploadCertificateDto>();

    response.data = new UploadCertificateDto({
      certificate: new GetCertificateDto(certificate),
      s3Params: s3PresignedUrl,
    });

    return response;
  }

  @Put(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateController.prototype.updateCertificateById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @ApiBaseResponse(UploadCertificateDto)
  async updateCertificateById(
    @Param('id') id: string,
    @Body() dto: CreateCertificateDto,
  ) {
    const { result, s3PresignedUrl, certificate } =
      await this.certificateService.updateCertificate({
        id,
        dto,
      });

    if (s3PresignedUrl) {
      const response = new BaseResponseDto<UploadCertificateDto>();

      response.data = new UploadCertificateDto({
        certificate: new GetCertificateDto(certificate),
        s3Params: s3PresignedUrl,
      });
      return response;
    }

    const response = new BaseResponseDto<UpdateResult>();
    response.data = result;

    return response;
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateController.prototype.deleteCertificateById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  async deleteCertificateById(@Param('id') id: string) {
    const result = await this.certificateService.deleteCertificate(id);

    const response = new BaseResponseDto<DeleteResult>();
    response.data = result;

    return response;
  }

  @Get(':id/download-url')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateController.prototype.deleteCertificateById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  async getCertificateDownloadUrl(@Param('id') id: string) {
    const certificate = await this.certificateService.findOneCertificate({
      id,
    });

    const response = new BaseResponseDto<string>();
    response.data = await createPresignedGet({
      Key: certificate.key,
      Expires: 60,
    });

    return response;
  }
}
