import {
  BadGatewayException,
  HttpException,
  HttpService,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { defaultTo } from 'lodash';
import { User } from '../user/User.entity';
import { CRMUpdateMember } from './crmUpdateMember';
import { formatWithTimezone } from '../utils/date';
import { DEFAULT_TIMEZONE } from '../utils/constants';
import { UserTaxInvoice } from '../user/UserTaxInvoice.entity';
import { Gender } from '../user/Gender.enum';

@Injectable()
export class CRMMemberService {
  private readonly logger = new Logger(CRMMemberService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserTaxInvoice)
    private readonly userTaxInvoice: Repository<UserTaxInvoice>,
    private readonly httpService: HttpService,
  ) {}

  async updateMember(seacId: string) {
    const user = await this.userRepository.findOne({ seacId });
    if (!user) {
      return null;
    }
    const taxInvoice = await this.userTaxInvoice.findOne({
      user,
      isDefault: true,
    });
    const payload: CRMUpdateMember = {
      memberid: user.seacId,
      email: user.email as string,
      gender: this.transformGender(user.gender),
      phoneno: defaultTo(user.phoneNumber, undefined),
      lineid: defaultTo(user.lineId, undefined),
      birthdate: user.dob
        ? formatWithTimezone(user.dob, DEFAULT_TIMEZONE, 'd MMM yyyy')
        : '01 Jan 1900',
      companyname: defaultTo(user.lineId, undefined),
      jobtitle: defaultTo(user.jobTitle, undefined),
      fulltaxname: taxInvoice?.taxEntityName,
      fulltaxheadofficebranch: defaultTo(
        taxInvoice?.headOfficeOrBranch,
        undefined,
      ),
      fulltaxphonecontact: taxInvoice?.contactPhoneNumber,
      fulltaxid: taxInvoice?.taxId,
      fulltaxaddress1: taxInvoice?.taxAddress,
      fulltaxaddress2: taxInvoice?.subdistrict.subdistrictCode,
      fulltaxaddress3: taxInvoice?.district.districtCode,
      fulltaxaddress4: taxInvoice?.province.provinceCode,
      fulltaxaddress5: taxInvoice?.country,
      fulltaxpostcode: taxInvoice?.zipCode,
    };
    if (process.env.IS_PRODUCTION !== 'true') {
      this.logger.log('CRM Member mapped payload', JSON.stringify(payload));
    }

    const path = this.configService.get<string>('CRM_UPDATE_MEMBER_PATH');
    const sig = this.configService.get<string>('SIGNATURE_UPDATE_MEMBER');
    try {
      const res = await this.httpService
        .post(`${path}${sig}`, payload)
        .toPromise();

      return res;
    } catch (error) {
      this.logger.error('CRM error', error);

      if (error.response) {
        this.logger.error(
          'CRM error response',
          JSON.stringify(error.response.data),
        );
        throw new HttpException(
          {
            source: error.response.request?.host,
            ...error.response.data,
          },
          error.response.status,
        );
      }

      throw new BadGatewayException(error.message);
    }
  }

  private transformGender(gender: Gender | null) {
    switch (gender) {
      case Gender.Male:
        return 'M';
      case Gender.Female:
        return 'F';
      case Gender.Other:
        return 'O';
      default:
        return undefined;
    }
  }
}
