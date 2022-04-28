import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  getPaginationRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Repository } from 'typeorm';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { EmailNotificationSenderDomain } from '@seaccentral/core/dist/notification/EmailNotificationSenderDomain.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { htmlToText } from '@seaccentral/core/dist/utils/htmlToText';
import { NotificationVariableDict } from '@seaccentral/core/dist/notification/NotificationVariableDict';
import { INotificationVariable } from '@seaccentral/core/dist/notification/interface/INotificationVariable';
import { UpdateEmailNotificationDto } from './dto/updateEmailNotification.dto';

@Injectable()
export class EmailNotificationService extends TransactionFor<EmailNotificationService> {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    @InjectRepository(EmailNotificationSenderDomain)
    private readonly emailNotificationSenderDomainRepository: Repository<EmailNotificationSenderDomain>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  async getAll(dto: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(dto);
    const { order, orderBy } = getSortRequestParams(dto);
    let query = this.emailNotificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.triggerType', 'triggerType')
      .leftJoinAndSelect('notification.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory');

    if (order && orderBy) {
      if (orderBy === 'subject') {
        query = query.orderBy('notification.title', order);
      } else if (orderBy === 'triggerType') {
        query = query.orderBy('triggerType.displayName', order);
      } else if (orderBy === 'category') {
        query = query.orderBy('parentCategory.name', order);
      }
    } else {
      query = query.orderBy('notification.title', 'ASC');
    }

    const total = await query.getCount();
    const data = await query.skip(skip).take(take).getMany();
    return { data, total };
  }

  async getEmailNotificationById(id: string) {
    const emailNotification = await this.emailNotificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.subject', 'subject')
      .leftJoinAndSelect('notification.bodyHTML', 'bodyHTML')
      .leftJoinAndSelect('notification.bodyText', 'bodyText')
      .leftJoinAndSelect('notification.emailFormatEn', 'emailFormatEn')
      .leftJoinAndSelect('notification.emailFormatTh', 'emailFormatTh')
      .leftJoinAndSelect('notification.category', 'category')
      .leftJoinAndSelect('notification.senderEmailDomain', 'senderEmailDomain')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .leftJoinAndSelect('notification.triggerType', 'triggerType')
      .where('notification.id = :id', { id })
      .getOne();

    if (!emailNotification)
      throw new HttpException(
        'Email notification not found.',
        HttpStatus.NOT_FOUND,
      );

    return emailNotification;
  }

  async updateEmailNotificationStatus(id: string, isActive: boolean) {
    return this.emailNotificationRepository.save({
      id,
      isActive,
    });
  }

  async updateEmailNotification(id: string, dto: UpdateEmailNotificationDto) {
    const emailNotification = await this.emailNotificationRepository.findOne(
      id,
    );
    if (!emailNotification)
      throw new HttpException(
        'Not found email notification',
        HttpStatus.NOT_FOUND,
      );

    const variableRegex = /(?!\{\{)([A-Za-z0-9]+)(?=\}\})/gim;
    const matchEn = dto.bodyHTML.nameEn?.match(variableRegex);
    const matchTh = dto.bodyHTML.nameTh?.match(variableRegex);
    if (
      !this.validateVariables(emailNotification.availableVariables, matchEn) ||
      !this.validateVariables(emailNotification.availableVariables, matchTh)
    ) {
      throw new HttpException('Variables not allowed', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.emailNotificationRepository.save({
        id,
        receiverRoles: dto.receiverRoles,
        senderEmailUser: dto.senderEmailUser,
        senderEmailDomain: { id: dto.senderEmailDomainId },
        emailFormatEn: { id: dto.emailFormatEnId },
        emailFormatTh: { id: dto.emailFormatThId },
        subject: this.languageRepository.create({
          nameEn: dto.subject.nameEn,
          nameTh: dto.subject.nameTh,
        }),
        bodyHTML: this.languageRepository.create({
          nameEn: dto.bodyHTML.nameEn,
          nameTh: dto.bodyHTML.nameTh,
        }),
        bodyText: this.languageRepository.create({
          nameEn: htmlToText(dto.bodyHTML.nameEn || ''),
          nameTh: htmlToText(dto.bodyHTML.nameTh || dto.bodyHTML.nameEn || ''),
        }),
      });

      // Remove old language after we replace the new one (above) successfully.
      const deletePromises = [
        emailNotification.subject?.id,
        emailNotification.bodyHTML?.id,
        emailNotification.bodyText?.id,
      ]
        .filter((deleteId) => !!deleteId)
        .map((deleteId) => this.languageRepository.delete({ id: deleteId }));
      await Promise.all(deletePromises);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getEmailNotificationDomains() {
    return this.emailNotificationSenderDomainRepository.find({
      where: { isActive: true },
      order: { domain: 'ASC' },
    });
  }

  private validateVariables(
    availableVariables: INotificationVariable[],
    matches: RegExpMatchArray | null | undefined,
  ) {
    if (!matches?.length) return true;

    return matches.every((m) => availableVariables.some((v) => v.alias === m));
  }
}
