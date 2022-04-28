import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { SendEmailQuery } from '@seaccentral/core/dist/notification/dto/SendEmailQuery';
import { EmailNotification } from '@seaccentral/core/dist/notification/EmailNotification.entity';
import {
  constructEmailFromTemplate,
  sendNotificationEmail,
} from '@seaccentral/core/dist/utils/email';
import { Repository } from 'typeorm';
import { UserEmailNotificationService } from './userEmailNotification.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly userEmailNotificationService: UserEmailNotificationService,

    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
  ) {}

  async sendEmail({
    key,
    replacements,
    to,
    options,
    language,
  }: SendEmailQuery) {
    const template = await this.emailNotificationRepository
      .createQueryBuilder('emailNotif')
      .leftJoinAndSelect('emailNotif.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .leftJoinAndSelect('emailNotif.subject', 'subject')
      .leftJoinAndSelect('emailNotif.bodyHTML', 'bodyHTML')
      .leftJoinAndSelect('emailNotif.bodyText', 'bodyText')
      .leftJoinAndSelect('emailNotif.emailFormatEn', 'emailFormatEn')
      .leftJoinAndSelect('emailNotif.emailFormatTh', 'emailFormatTh')
      .leftJoinAndSelect('emailNotif.senderEmailDomain', 'senderEmailDomain')
      .where('emailNotif.isActive = :isActive', { isActive: true })
      .andWhere('category.key = :key', { key })
      .getOne();

    if (!template) {
      throw new HttpException(
        'Email notification template not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { html, text, subject } = constructEmailFromTemplate({
      template,
      format:
        language === LanguageCode.TH
          ? template.emailFormatTh
          : template.emailFormatEn,
      language,
      replacements,
    });

    // SEAC-1052 TODO: use legit template sender
    const from = 'central_noreply@seasiacenter.com';
    // const from = `${template.senderEmailUser}@${template.senderEmailDomain.domain}`

    const result = await sendNotificationEmail({
      from,
      html,
      text,
      subject,
      to,
      options,
    });

    const recipients = typeof to === 'string' ? [to] : to;

    recipients.forEach((recipient) => {
      this.userEmailNotificationService.create({
        from,
        html,
        text,
        subject,
        to: recipient,
        category: template.category.parent.name,
        awsMessageId: result.response,
      });
    });
  }
}
