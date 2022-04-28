import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailFormat } from '@seaccentral/core/dist/notification/EmailFormat.entity';
import { Repository } from 'typeorm';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { deleteObjectFromS3 } from '@seaccentral/core/dist/utils/s3';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { htmlToText } from '@seaccentral/core/dist/utils/htmlToText';
import { EmailFormatRequestDto } from './dto/emailFormat.dto';

@Injectable()
export class EmailFormatService extends TransactionFor<EmailFormatService> {
  constructor(
    @InjectRepository(EmailFormat)
    private readonly emailFormatRepository: Repository<EmailFormat>,
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async saveEmailFormat(dto: EmailFormatRequestDto) {
    const hasDefault =
      (await this.emailFormatRepository.count({ isDefault: true })) > 0;
    if (!hasDefault) {
      dto.isDefault = true;
    }
    if (dto.isDefault) {
      await this.emailFormatRepository.update(
        { isDefault: true },
        { isDefault: false },
      );
    }
    if (dto.id) {
      const entity = await this.emailFormatRepository.findOne({ id: dto.id });
      if (
        dto.headerImageKey !== entity?.headerImageKey &&
        entity?.headerImageKey
      ) {
        deleteObjectFromS3(entity.headerImageKey);
      }
      if (
        dto.footerImageKey !== entity?.footerImageKey &&
        entity?.footerImageKey
      ) {
        deleteObjectFromS3(entity.footerImageKey);
      }
    }
    const entity = await this.emailFormatRepository.save<Partial<EmailFormat>>({
      id: dto.id,
      formatName: dto.formatName,
      teamName: dto.teamName,
      headerImageKey: dto.headerImageKey,
      footerImageKey: dto.footerImageKey,
      footerText: dto.footerHTML ? htmlToText(dto.footerHTML) : null,
      footerHTML: dto.footerHTML,
      copyrightText: dto.copyrightText,
      isDefault: dto.isDefault,
    });

    return entity;
  }

  async findEmailFormat(queryOptions: BaseQueryDto) {
    const result = await this.emailFormatRepository.find({
      order: {
        isDefault: 'DESC',
        ...(queryOptions?.orderBy === 'formatName'
          ? { formatName: queryOptions.order }
          : {}),
      },
    });

    return result;
  }

  async findEmailFormatById(id: string) {
    const result = await this.emailFormatRepository.findOne({ id });
    if (!result) {
      throw new NotFoundException('email format not found');
    }

    return result;
  }

  async removeEmailFormat(id: string) {
    const entity2remove = await this.emailFormatRepository.findOne({ id });
    if (entity2remove?.isDefault) {
      throw new BadRequestException(
        'Removing default email format is not allowed',
      );
    }
    if (entity2remove) {
      await this.useDefaultEmailFormatNotification(entity2remove);
    }
    if (entity2remove?.headerImageKey) {
      await deleteObjectFromS3(entity2remove.headerImageKey);
    }
    if (entity2remove?.footerImageKey) {
      await deleteObjectFromS3(entity2remove.footerImageKey);
    }
    const result = await this.emailFormatRepository.delete({ id });

    return result;
  }

  private async useDefaultEmailFormatNotification(emailFormat: EmailFormat) {
    const defaultEmailFormat = await this.emailFormatRepository.findOne({
      isDefault: true,
    });
    await Promise.all([
      this.emailNotificationRepository.update(
        { emailFormatEn: emailFormat },
        { emailFormatEn: defaultEmailFormat },
      ),
      this.emailNotificationRepository.update(
        { emailFormatTh: emailFormat },
        { emailFormatTh: defaultEmailFormat },
      ),
    ]);
  }
}
