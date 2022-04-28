import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpService,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { ContactTrial } from './contact.entity';
import { FindOneContactQuery } from '../dto/FindOneContactQuery.dto';
import { SubscriptionPlan } from '../payment/SubscriptionPlan.entity';
import { Subdistrict } from '../address/Subdistrict.entity';
import { addToDateByPlan, formatWithTimezone } from '../utils/date';
import { CreateContactTrialDto } from '../dto/CreateContact.dto';

@Injectable()
export class ContactTrialService {
  private readonly logger = new Logger(ContactTrialService.name);

  constructor(
    @InjectRepository(ContactTrial)
    private contactTrialRepository: Repository<ContactTrial>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subdistrict)
    private subdistrictRepository: Repository<Subdistrict>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async create(createContactTrialDto: CreateContactTrialDto) {
    const { billingsubdistrict, skucode, ...createContactTrail } =
      createContactTrialDto;

    const contactTrial = this.contactTrialRepository.create({
      ...createContactTrail,
      id: uuid(),
    });

    const subdistrict = await this.subdistrictRepository.findOne({
      id: billingsubdistrict,
    });

    if (!subdistrict && billingsubdistrict !== undefined)
      throw new BadRequestException('subdistrictId not found');

    const product = await this.subscriptionPlanRepository.findOne({
      productId: skucode,
      isPublic: true,
      isActive: true,
    });

    if (!product) throw new BadRequestException('SKU code not found');

    const { name } = product;
    const { id, phoneno, products, ...data } = contactTrial;
    const startDate = new Date();
    const endDate = addToDateByPlan(startDate, product);
    // TODO : Still based on V3
    const contactCRM = {
      ...data,
      phoneno,
      products: products ?? ['default_products'],
      leadid: id,
      billingsubdistinctcode: subdistrict ? subdistrict.subdistrictCode : '',
      billingpostalcode: subdistrict ? subdistrict.zipCode : '',
      skuname: name,
      skucode,
      updatedatetime: formatWithTimezone(startDate),
      registerdatetime: formatWithTimezone(startDate),
      senddatatime: formatWithTimezone(startDate),
      packagestartdate: formatWithTimezone(startDate),
      packageenddate: formatWithTimezone(endDate),
      // TODO Default values for CRM Integrations
      utm_source: data.utm_source ?? '4',
      tracking: data.tracking ?? 'default_tracking',
      cookieid: data.cookieid ?? 'default_cookieid',
      stateid: data.stateid ?? 'default_stateid',
      sessionid: data.sessionid ?? 'default_sessionid',
      username: 'default_username',
    };

    try {
      const PATH = this.configService.get<string>('CRM_TRIAL_PATH');
      const sig = this.configService.get<string>('SIGNATURE_TRIAL');

      await this.httpService.post(`${PATH}${sig}`, contactCRM).toPromise();

      if (subdistrict) contactTrial.billingsubdistrict = subdistrict;
      contactTrial.skucode = product;
      contactTrial.onCRM = true;
      contactTrial.packagestartdate = startDate;
      contactTrial.packageenddate = endDate;
    } catch (e) {
      this.logger.error('CRM Lead Contact Trial error', e);

      if (e.response) {
        this.logger.error(
          'CRM Contact trial error response',
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
      await this.contactTrialRepository.save(contactTrial);
    }
  }

  async findAll() {
    return this.contactTrialRepository.find();
  }

  async findOne(findOneContactQuery: FindOneContactQuery) {
    return this.contactTrialRepository.find(findOneContactQuery);
  }
}
