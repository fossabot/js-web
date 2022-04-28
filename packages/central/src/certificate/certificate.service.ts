import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from '@seaccentral/core/dist/certificate/certificate.entity';
import { UserCertificate } from '@seaccentral/core/dist/certificate/UserCertificate.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { User } from '@seaccentral/core/dist/user/User.entity';
import { deleteObjectFromS3 } from '@seaccentral/core/dist/utils/s3';
import { FindConditions, ILike, Repository } from 'typeorm';
import * as s3UrlConditionBuilder from '@seaccentral/core/dist/utils/s3UrlConditionBuilder';
import { UploadService } from '../upload/upload.service';
import { S3_CERTIFICATE_FOLDER } from '../utils/constants';
import { CreateCertificateDto } from './dto/CreateCertificate.dto';

export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(UserCertificate)
    private readonly userCertificateRepository: Repository<UserCertificate>,
    private readonly uploadService: UploadService,
  ) {}

  async findAllCertificates(
    dto: BaseQueryDto,
  ): Promise<[Certificate[], number]> {
    const searchField = dto.searchField
      ? { [dto.searchField]: ILike(`%${dto.search}%`) }
      : {};
    const orderByField = dto.orderBy ? { [dto.orderBy]: dto.order } : {};
    const certificates = await this.certificateRepository.findAndCount({
      where: {
        ...searchField,
      },
      take: dto.take,
      skip: dto.skip,
      order: {
        ...orderByField,
      },
    });

    return certificates;
  }

  async findOneCertificate(params: FindConditions<Certificate>) {
    const certificate = await this.certificateRepository.findOne(params);

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async findUserCertificates(params: { user: User }) {
    const query = this.userCertificateRepository
      .createQueryBuilder('uc')
      .innerJoinAndSelect(
        'uc.certificate',
        'certificate',
        'uc.userId = :userId',
        {
          userId: params.user.id,
        },
      );

    return query.getMany();
  }

  async createCertificate(params: {
    dto: CreateCertificateDto;
    uploader: User;
  }) {
    const { dto, uploader } = params;
    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: dto.filename,
      folder: S3_CERTIFICATE_FOLDER,
      expires: 300,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_CERTIFICATE_FOLDER),
        s3UrlConditionBuilder.maxSizeMB(30),
        s3UrlConditionBuilder.contentType(dto.mime as string),
      ),
    });

    const certificate = await this.certificateRepository.create({
      ...dto,
      key: s3PresignedUrl.fields.key,
      uploader,
    });

    const savedCertificate = await this.certificateRepository.save(certificate);

    return { certificate: savedCertificate, s3PresignedUrl };
  }

  async updateCertificate(params: {
    id: Certificate['id'];
    dto: CreateCertificateDto;
  }) {
    const { id, dto } = params;

    const certificate = await this.findOneCertificate({ id });

    const isSameFile = certificate.hash === dto.hash;
    if (isSameFile) {
      const result = await this.certificateRepository.update(
        { id },
        {
          ...dto,
          key: certificate.key,
        },
      );
      return { result, certificate };
    }

    const s3PresignedUrl = await this.uploadService.getPresignedPostUrl({
      fileName: dto.filename,
      folder: S3_CERTIFICATE_FOLDER,
      expires: 300,
      conditions: s3UrlConditionBuilder.build(
        s3UrlConditionBuilder.startsWith(S3_CERTIFICATE_FOLDER),
        s3UrlConditionBuilder.maxSizeMB(30),
        s3UrlConditionBuilder.contentType(dto.mime as string),
      ),
    });

    const result = await this.certificateRepository.update(
      { id },
      {
        ...dto,
        key: s3PresignedUrl.fields.key,
      },
    );

    return { result, s3PresignedUrl, certificate };
  }

  async deleteCertificate(id: Certificate['id']) {
    const certificate = await this.findOneCertificate({ id });

    const [result] = await Promise.all([
      this.certificateRepository.delete({ id }),
      deleteObjectFromS3(certificate.key),
    ]);

    return result;
  }
}
