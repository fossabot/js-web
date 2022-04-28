import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { CreateContactCorporateDto } from '../dto/CreateContact.dto';
import { ContactCorporate } from './contact.entity';
import { FindOneContactQuery } from '../dto/FindOneContactQuery.dto';
import { sendLeadContactToCRM } from './crm.provider';
import { FormType } from './FormType.enum';

@Injectable()
export class ContactCorporateService {
  private readonly logger = new Logger(ContactCorporateService.name);

  constructor(
    @InjectRepository(ContactCorporate)
    private contactCorporateRepository: Repository<ContactCorporate>,
    private configService: ConfigService,
  ) {}

  async create(createContactCorporateDto: CreateContactCorporateDto) {
    const contactCorporate = this.contactCorporateRepository.create({
      ...createContactCorporateDto,
      id: uuid(),
    });

    try {
      await sendLeadContactToCRM(
        contactCorporate,
        FormType.CORPORATE,
        this.configService.get<string>('CRM_CORPORATE_PATH'),
        this.configService.get<string>('SIGNATURE_CORPORATE'),
      );
      contactCorporate.onCRM = true;
    } catch (e) {
      this.logger.error('CRM Lead Contact Corporate error', e);

      if (e.response) {
        this.logger.error(
          'CRM Lead Corporate error response',
          JSON.stringify(e.response.data),
        );
        throw new HttpException(
          {
            source: e.response.request.host,
            ...e.response.data,
          },
          e.response.status,
        );
      }

      throw new BadGatewayException();
    } finally {
      await this.contactCorporateRepository.save(contactCorporate);
    }
  }

  async findAll() {
    return this.contactCorporateRepository.find();
  }

  async findOne(findOneContactQuery: FindOneContactQuery) {
    return this.contactCorporateRepository.find(findOneContactQuery);
  }
}
