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
import { CreateContactRetailDto } from '../dto/CreateContact.dto';
import { ContactRetail } from './contact.entity';
import { FindOneContactQuery } from '../dto/FindOneContactQuery.dto';
import { sendLeadContactToCRM } from './crm.provider';
import { FormType } from './FormType.enum';
import { UsersService } from '../user/users.service';

@Injectable()
export class ContactRetailService {
  private readonly logger = new Logger(ContactRetailService.name);

  constructor(
    @InjectRepository(ContactRetail)
    private contactRetailRepository: Repository<ContactRetail>,
    private configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async create(createContactRetailDto: CreateContactRetailDto) {
    const contactRetail = this.contactRetailRepository.create({
      ...createContactRetailDto,
      id: uuid(),
    });

    try {
      const res = await sendLeadContactToCRM(
        contactRetail,
        FormType.RETAIL,
        this.configService.get<string>('CRM_RETAIL_PATH'),
        this.configService.get<string>('SIGNATURE_RETAIL'),
      );
      contactRetail.onCRM = true;

      if (createContactRetailDto.signupmember) {
        const [{ ID }] = res;
        if (ID === '') {
          this.logger.warn(
            `CRM response with an empty ID, ${createContactRetailDto.email} will not have seacId`,
            JSON.stringify(res),
          );
        } else {
          await this.usersService.updateSeacIdByEmail(
            createContactRetailDto.email,
            ID,
          );
        }
      }

      return res;
    } catch (e) {
      this.logger.error('CRM Lead Contact Retail error', e);

      if (e.response) {
        this.logger.error(
          'CRM Lead Retail error response',
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
      await this.contactRetailRepository.save(contactRetail);
    }
  }

  async findAll() {
    return this.contactRetailRepository.find();
  }

  async findOne(findOneContactQuery: FindOneContactQuery) {
    return this.contactRetailRepository.find(findOneContactQuery);
  }
}
