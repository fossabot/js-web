import qs from 'qs';
import { Repository } from 'typeorm';
import axios, { Method } from 'axios';
import { ModuleRef } from '@nestjs/core';

// eslint-disable-next-line no-restricted-imports
import { format, addDays } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { defaultTo } from 'lodash';
import * as xml from '../utils/xml';
import { User } from '../user/User.entity';
import {
  InstancyPackageType,
  SubscriptionPlan,
} from '../payment/SubscriptionPlan.entity';
import { addToDateByPlan } from '../utils/date';
import { Deprecated } from '../utils/custom-validator';
import { TransactionFor } from '../utils/withTransaction';
import { Subscription } from '../payment/Subscription.entity';
import { UserThirdParty } from '../user/UserThirdParty.entity';
import { Organization } from '../organization/Organization.entity';
import { UserThirdPartyType } from '../user/UserThirdPartyType.enum';

// TODO: Reuse same payment options for payment service.
export enum PAYMENT_OPTIONS {
  CREDIT_CARD = 'CC',
  QR_CODE = 'THQR',
  INSTALLMENT_PAYMENT = 'IPP',
}

interface IMembershipRequestParams {
  amount: string;
  startDate: string;
  expiryDate: string;
  durationName: string;
  membershipId: string;
  paymentOption: string;
  membershipDurationId: string;
}

interface IRequestParams {
  baseUrl: string;
  astrKey: string;
}

@Injectable()
export class InstancyService extends TransactionFor<InstancyService> {
  private readonly logger = new Logger(InstancyService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(UserThirdParty)
    private userThirdPartyRepository: Repository<UserThirdParty>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  @Deprecated()
  async updateInstancyUser(
    user: User,
    password: string,
  ): Promise<UserThirdParty> {
    if (!user.email) {
      this.logger.log('User email not found.');
      throw new HttpException('User email not exist.', HttpStatus.NOT_FOUND);
    }
    const user3rdParty = await this.userThirdPartyRepository.findOne({
      where: {
        userId: user.id,
        userThirdPartyType: UserThirdPartyType.INSTANCY,
      },
    });
    if (!user3rdParty) {
      this.logger.log(`User with this id dont have instancy data. ${user}`);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User with this id dont have instancy data',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const subscription = await this.subscriptionRepository.findOne({
      order: {
        createdAt: 'DESC',
      },
      where: {
        isActive: true,
        userId: user3rdParty.userId,
      },
    });
    if (!subscription || !subscription.subscriptionPlan) {
      throw new HttpException(
        'User does not subsribed to any package.',
        HttpStatus.NOT_FOUND,
      );
    }
    const requestParams = this.getRequestParams(
      subscription.subscriptionPlan.packageType as InstancyPackageType,
      subscription.subscriptionPlan.isDefaultPackage,
    );
    if (!requestParams || !requestParams.baseUrl || !requestParams.astrKey) {
      this.logger.error(
        `Cannot find baseUrl or astrKey. Please check setup for this plan ${subscription.subscriptionPlan.id}.`,
      );
      throw new HttpException(
        'Default subscription plan not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    const result = await this.updateUser(
      user,
      user3rdParty,
      subscription.subscriptionPlan.siteId as string,
      requestParams,
      {
        paymentOption: this.getInstancyPaymentType(PAYMENT_OPTIONS.CREDIT_CARD),
        membershipDurationId:
          subscription.subscriptionPlan.membershipDurationId || '',
        password,
      },
    );
    return result;
  }

  @Deprecated()
  async createInstancyUser(
    user: User,
    password: string,
    organization?: Organization,
  ): Promise<UserThirdParty> {
    if (!user.email) {
      this.logger.error('User email not found.');
      throw new HttpException(
        'User email does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    const exist = await this.userThirdPartyRepository.findOne({
      where: {
        userId: user.id,
        userThirdPartyType: UserThirdPartyType.INSTANCY,
      },
    });
    if (exist) {
      this.logger.error(`User already have instancy user data. ${user}`);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User with this id is already have instancy account!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const subscriptionPlan = await this.subscriptionPlanRepository.findOne({
      where: {
        isDefaultPackage: true,
      },
    });
    if (!subscriptionPlan) {
      this.logger.error('Default subscription plan does not exist.');
      throw new HttpException(
        'Default subscription plan does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    const requestParams = this.getRequestParams(
      subscriptionPlan.packageType as InstancyPackageType,
      subscriptionPlan.isDefaultPackage,
    );
    if (!requestParams || !requestParams.baseUrl || !requestParams.astrKey) {
      this.logger.error(
        `Cannot find baseUrl or astrKey. Please check setup for this plan ${subscriptionPlan.id}.`,
      );
      throw new HttpException(
        'Default subscription plan not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    const userInfoForAllSites = await this.getUserInfoByEmailForAllSites(
      user.email,
      subscriptionPlan.siteId as string,
      requestParams,
    );

    let instancyUser;
    if (!userInfoForAllSites) {
      instancyUser = await this.createUser(
        user,
        subscriptionPlan.siteId as string,
        requestParams,
        {
          paymentOption: this.getInstancyPaymentType(
            PAYMENT_OPTIONS.CREDIT_CARD,
          ),
          membershipDurationId: subscriptionPlan.membershipDurationId || '',
          password: password || '',
        },
      );
    } else {
      this.logger.log(
        'Existing instancy user',
        JSON.stringify(userInfoForAllSites),
      );
      instancyUser = { ...userInfoForAllSites[0] };
    }

    if (!instancyUser) {
      this.logger.error('no instancy user.');
      throw new HttpException(
        'Instancy user does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }

    const subscription = this.subscriptionRepository.create({
      startDate: new Date(new Date().toUTCString()),
      endDate: new Date(new Date().toUTCString()),
      organization,
      subscriptionPlan,
      instancyUserId: instancyUser.UserID[0],
      user,
    });
    await this.subscriptionRepository.save(subscription);
    const userThirdParty = this.userThirdPartyRepository.create({
      userThirdPartyId: instancyUser.UserID[0],
      userThirdPartyType: UserThirdPartyType.INSTANCY,
      user,
    });
    await this.userThirdPartyRepository.save(userThirdParty);

    return userThirdParty;
  }

  @Deprecated()
  async setupInstancyUser(
    user: User,
    password: string,
    subscriptionPlan: SubscriptionPlan,
    paymentOption?: PAYMENT_OPTIONS,
    expiryDate?: string,
  ): Promise<string | null> {
    try {
      if (!user.email) {
        this.logger.log('User email not found.');
        return null;
      }

      const { siteId, packageType } = subscriptionPlan;

      if (!siteId || !packageType) {
        this.logger.error(
          `Cannot find siteId or packageType. Please check setup for this plan ${subscriptionPlan.id}.`,
        );
        return null;
      }

      const requestParams = this.getRequestParams(
        packageType,
        subscriptionPlan.isDefaultPackage,
      );
      if (!requestParams || !requestParams.baseUrl || !requestParams.astrKey) {
        this.logger.error(
          `Cannot find baseUrl or astrKey. Please check setup for this plan ${subscriptionPlan.id}.`,
        );
        return null;
      }

      const userInfoForAllSites = await this.getUserInfoByEmailForAllSites(
        user.email,
        siteId,
        requestParams,
      );

      this.logger.log(
        'userInfoForAllSites',
        JSON.stringify(userInfoForAllSites),
      );

      let isNewUser = false;
      let instancyUser;
      if (!userInfoForAllSites) {
        isNewUser = true;
        instancyUser = await this.createUser(user, siteId, requestParams, {
          paymentOption: this.getInstancyPaymentType(
            paymentOption || PAYMENT_OPTIONS.CREDIT_CARD,
          ),
          membershipDurationId: subscriptionPlan.membershipDurationId || '',
          password,
        });
        this.logger.log('created instancy user', JSON.stringify(instancyUser));
      } else {
        instancyUser = userInfoForAllSites.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (userInfo: any) => userInfo.SiteID[0] === siteId,
        );

        if (!instancyUser) {
          instancyUser = await this.copyUserToSite(
            user.email,
            siteId,
            requestParams,
          );
          this.logger.log('copied instancy user', JSON.stringify(instancyUser));
        }
      }

      if (!instancyUser) {
        return null;
      }

      const exist = await this.userThirdPartyRepository.findOne({
        where: {
          userId: user.id,
          userThirdPartyType: UserThirdPartyType.INSTANCY,
        },
      });
      if (!exist) {
        const userThirdParty = await this.userThirdPartyRepository.create({
          userThirdPartyId: instancyUser.UserID[0],
          userThirdPartyType: UserThirdPartyType.INSTANCY,
          user,
        });
        await this.userThirdPartyRepository.save(userThirdParty);
      }

      if (!isNewUser) {
        const userMembershipDetails = await this.getUserMembershipDetails(
          instancyUser.UserID[0],
          siteId,
          requestParams,
        );

        this.logger.log(
          'userMembershipDetails',
          JSON.stringify(userMembershipDetails),
        );

        const membershipParams = await this.getMembershipParams(
          siteId,
          paymentOption || PAYMENT_OPTIONS.CREDIT_CARD,
          subscriptionPlan,
          user,
          requestParams,
        );

        if (!membershipParams) {
          return null;
        }

        if (expiryDate) {
          membershipParams.expiryDate = expiryDate;
        }
        const isUpdated = await this.updateMemebership(
          instancyUser.UserID[0],
          siteId,
          membershipParams,
          requestParams,
        );

        this.logger.log('updatedMembership', String(isUpdated));

        return isUpdated ? instancyUser.UserID[0] : null;
      }

      return instancyUser.UserID[0] || null;
      // TODO: If this process fails, we can set the status so that a cron job can retry this
    } catch (error) {
      this.logger.error('Something went wrong when setting up user.', error);
      return null;
    }
  }

  @Deprecated()
  async deactivateSubscription(
    user: User,
    subscriptionPlan: SubscriptionPlan,
    paymentOption?: PAYMENT_OPTIONS,
  ) {
    try {
      if (!user.email) {
        this.logger.error('User email not found.');
        throw new HttpException(
          'User email does not exist.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { siteId, packageType } = subscriptionPlan;

      if (!siteId || !packageType) {
        this.logger.error(
          `Cannot find siteId or packageType. Please check setup for this plan ${subscriptionPlan.id}.`,
        );
        throw new HttpException('User email not exist.', HttpStatus.NOT_FOUND);
      }

      const requestParams = this.getRequestParams(
        packageType,
        subscriptionPlan.isDefaultPackage,
      );
      if (!requestParams || !requestParams.baseUrl || !requestParams.astrKey) {
        this.logger.error(
          `Cannot find baseUrl or astrKey. Please check setup for this plan ${subscriptionPlan.id}.`,
        );
        throw new HttpException('User email not exist.', HttpStatus.NOT_FOUND);
      }

      const userInfoForAllSites = await this.getUserInfoByEmailForAllSites(
        user.email,
        siteId,
        requestParams,
      );

      this.logger.log(
        'userInfoForAllSites',
        JSON.stringify(userInfoForAllSites),
      );

      const instancyUser = userInfoForAllSites.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (userInfo: any) => userInfo.SiteID[0] === siteId,
      );
      if (!instancyUser) {
        this.logger.log(
          'instancy user does not exist.',
          JSON.stringify(instancyUser),
        );
        throw new HttpException(
          'User does not exist on instancy.',
          HttpStatus.NOT_FOUND,
        );
      }

      const userMembershipDetails = await this.getUserMembershipDetails(
        instancyUser.UserID[0],
        siteId,
        requestParams,
      );

      if (!userMembershipDetails) {
        this.logger.log(
          'Intancy user subscription does not exist.',
          JSON.stringify(subscriptionPlan),
        );
        throw new HttpException(
          'User does not subscribe to this package.',
          HttpStatus.NOT_FOUND,
        );
      }

      const membershipParams = await this.getMembershipParams(
        siteId,
        paymentOption || PAYMENT_OPTIONS.CREDIT_CARD,
        subscriptionPlan,
        user,
        requestParams,
      );

      if (!membershipParams) {
        return null;
      }
      const todayUTC = new Date();
      todayUTC.setHours(0);
      todayUTC.setMinutes(0);
      todayUTC.setSeconds(0);
      membershipParams.expiryDate = todayUTC.toUTCString();
      const isUpdated = await this.updateMemebership(
        instancyUser.UserID[0],
        siteId,
        membershipParams,
        requestParams,
      );

      this.logger.log('updatedMembership', String(isUpdated));

      return isUpdated ? instancyUser.UserID[0] : null;
    } catch (error) {
      this.logger.error('Something went wrong when setting up user.', error);
      throw error;
    }
  }

  private async getMembershipParams(
    siteId: string,
    paymentOption: PAYMENT_OPTIONS,
    subscriptionPlan: SubscriptionPlan,
    user: User,
    requestParams: IRequestParams,
  ): Promise<IMembershipRequestParams | null> {
    this.logger.log('subscriptionPlan', JSON.stringify(subscriptionPlan));

    const membershipDetail = await this.getMembershipDetails(
      siteId,
      requestParams,
    );

    if (!membershipDetail) {
      return null;
    }

    this.logger.log(
      'membershipDetail.MembershipDurations',
      JSON.stringify(membershipDetail.MembershipDurations),
    );

    const membershipDurationIndex =
      membershipDetail.MembershipDurations[0]?.MembershipDurationID?.indexOf(
        subscriptionPlan.membershipDurationId,
      );

    if (!(membershipDurationIndex >= 0)) {
      this.logger.log('Index not found', JSON.stringify(membershipDetail));
      return null;
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { user, subscriptionPlan, isActive: true },
    });

    const todayUTC = new Date(new Date().toUTCString());
    const startDate = format(todayUTC, 'M/dd/yyyy');
    const endDate = format(
      addDays(
        addToDateByPlan(
          defaultTo(existingSubscription?.endDate, todayUTC),
          subscriptionPlan,
        ),
        1,
      ),
      'M/dd/yyyy',
    );

    return {
      amount:
        membershipDetail.MembershipDurations[0].Amount[membershipDurationIndex],
      startDate,
      expiryDate: endDate,
      durationName:
        membershipDetail.MembershipDurations[0].DurationName[
          membershipDurationIndex
        ],
      membershipId:
        membershipDetail.MembershipDurations[0].MembershipID[
          membershipDurationIndex
        ],
      membershipDurationId:
        membershipDetail.MembershipDurations[0].MembershipDurationID[
          membershipDurationIndex
        ],
      paymentOption: this.getInstancyPaymentType(paymentOption),
    };
  }

  private getInstancyPaymentType(paymentType: PAYMENT_OPTIONS) {
    const paymentTypeMap = {
      [PAYMENT_OPTIONS.CREDIT_CARD]: 'Credit Card (online)',
      [PAYMENT_OPTIONS.QR_CODE]: 'QR Code',
      [PAYMENT_OPTIONS.INSTALLMENT_PAYMENT]: 'Credit Card (online)',
    };

    return paymentTypeMap[paymentType] || 'NA';
  }

  private async getUserInfoByEmailForAllSites(
    email: string,
    siteId: string,
    requestParams: IRequestParams,
  ) {
    const path = 'GetUserInfoByEmailForAllSites';
    const requestData = qs.stringify({
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
          <Request SiteID='${siteId}'>
            <UserDetails>
              <email><![CDATA[${email}]]></email>
            </UserDetails>
          </Request>
        </InstancyWrapper>`,
    });

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    if (!parsed.anyType._) {
      return null;
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];
    const userDetails = data?.UserDetails;

    if (!response || !userDetails || response?.$?.Result === 'Error') {
      this.logger.error(
        'Error getUserInfoByEmailForAllSites',
        JSON.stringify(response),
      );
      return null;
    }

    return userDetails;
  }

  private async createUser(
    user: User,
    siteId: string,
    requestParams: IRequestParams,
    params: {
      paymentOption: string;
      membershipDurationId: string;
      password: string;
    },
  ) {
    const path = 'CreateUser';
    // TODO: Remove the static password from here.
    const request = {
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
            <Request SiteID='${siteId}'>
              <UserDetails>
                <GroupID><![CDATA[${siteId}]]></GroupID>
                <First_Name><![CDATA[${user.firstName}]]></First_Name>
                <Gender></Gender>
                <Last_Name><![CDATA[${user.lastName}]]></Last_Name>
                <User_name><![CDATA[${user.email}]]></User_name>
                <Email><![CDATA[${user.email}]]></Email>
                <Password>${params.password || ''}</Password>
                <Phone_Number><![CDATA[${user.phoneNumber}]]></Phone_Number>
                <MembershipDurationID><![CDATA[${
                  params.membershipDurationId
                }]]></MembershipDurationID>
                <PaymentType><![CDATA[${params.paymentOption}]]></PaymentType>
              </UserDetails>
            </Request>
          </InstancyWrapper>`,
    };
    const requestData = qs.stringify(request);

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    this.logger.log('Create User Request OBJECT', requestData);
    this.logger.log('Create USer Request RAW', JSON.stringify(request));
    this.logger.log('Create User Response RAW', JSON.stringify(parsed));

    if (!parsed.anyType._) {
      return null;
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];
    const userDetails = data?.UserDetails?.[0];

    if (!response || !userDetails || response?.$?.Result === 'Error') {
      this.logger.error('Error creating user', JSON.stringify(response));
      return null;
    }

    return userDetails;
  }

  private async updateUser(
    user: User,
    user3rdParty: UserThirdParty,
    siteId: string,
    requestParams: IRequestParams,
    params: {
      paymentOption: string;
      membershipDurationId: string;
      password: string;
    },
  ) {
    const path = 'UpdateUser';
    const request = {
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
            <Request SiteID='${siteId}'>
              <UserDetails>
                <GroupID><![CDATA[${siteId}]]></GroupID>
                <UserID><![CDATA[${user3rdParty.userThirdPartyId}]]></UserID>
                <First_Name><![CDATA[${user.firstName}]]></First_Name>
                <Gender></Gender>
                <Last_Name><![CDATA[${user.lastName}]]></Last_Name>
                <User_name><![CDATA[${user.email}]]></User_name>
                <Email><![CDATA[${user.email}]]></Email>
                <Password>${params.password || ''}</Password>
                <Phone_Number><![CDATA[${user.phoneNumber}]]></Phone_Number>
                <Status><![CDATA[${user3rdParty.isActive}]]></Status>
              </UserDetails>
            </Request>
          </InstancyWrapper>`,
    };
    const requestData = qs.stringify(request);

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    this.logger.log('Update User Request OBJECT', requestData);
    this.logger.log('Update USer Request RAW', JSON.stringify(request));
    this.logger.log('Update User Response RAW', JSON.stringify(parsed));

    if (!parsed.anyType._) {
      return null;
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];
    const userDetails = data?.UserDetails?.[0];

    if (!response || !userDetails || response?.$?.Result === 'Error') {
      this.logger.error('Error updating user', JSON.stringify(response));
      return null;
    }

    return userDetails;
  }

  private async copyUserToSite(
    email: string,
    siteId: string,
    requestParams: IRequestParams,
  ) {
    const path = 'CopyUsertoASite';
    const requestData = qs.stringify({
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
          <Request SiteID='${siteId}'>
            <UserDetails>
              <email><![CDATA[${email}]]></email>
              <siteid><![CDATA[${siteId}]]></siteid>
            </UserDetails>
          </Request>
        </InstancyWrapper>`,
    });

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    if (!parsed.anyType._) {
      return null;
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];
    const userDetails = data?.UserDetails?.[0];

    if (!response || !userDetails || response?.$?.Result === 'Error') {
      this.logger.error('Error copyUserToSite', JSON.stringify(response));
      return null;
    }

    return userDetails;
  }

  private async getUserMembershipDetails(
    userId: string,
    siteId: string,
    requestParams: IRequestParams,
  ) {
    const path = 'UserMembershipDetails';
    const requestData = qs.stringify({
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
          <Request SiteID='${siteId}'>
            <UserMembershipDetails>
              <UserID>${userId}</UserID>
            </UserMembershipDetails>
          </Request>
        </InstancyWrapper>`,
    });

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    this.logger.log('User membership details RAW', JSON.stringify(parsed));

    if (!parsed.anyType._) {
      return null;
    }

    // NOTE: THIS IS A HACK AS Instancy was sending unparsable data.
    if (parsed.anyType._.search('<Response Result= "Error') !== -1) {
      parsed.anyType._ =
        '<?xml version="1.0" encoding="iso-8859-1"?><InstancyWrapper><Response Result= "Error" ResultDescription="Error while getting user membership data"/></InstancyWrapper>';
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];
    const userMembershipDetails = data?.UserMembershipDetails?.[0];

    if (
      !response ||
      !userMembershipDetails ||
      response?.$?.Result === 'Error'
    ) {
      this.logger.error(
        'Error getUserMembershipDetails',
        JSON.stringify(response),
      );
      return null;
    }

    return userMembershipDetails;
  }

  private async renewMembership(
    userId: string,
    siteId: string,
    params: IMembershipRequestParams,
    requestParams: IRequestParams,
  ) {
    const path = 'RenewMemebrship';
    const request = {
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
          <Request SiteID='${siteId}'>
            <RenewMemebrship>
              <MembershipID>${params.membershipId}</MembershipID>
              <DurationName>${params.durationName}</DurationName>
              <UserID>${userId}</UserID>
              <ExpiryDate>${params.expiryDate}</ExpiryDate>
              <MembershipDurationID>${params.membershipDurationId}</MembershipDurationID>
              <Paymentmode>${params.paymentOption}</Paymentmode>
              <StartDate>${params.startDate}</StartDate>
              <Amount>${params.amount}</Amount>
              <Notes></Notes>
              <RecurringProfileID></RecurringProfileID>
            </RenewMemebrship>
          </Request>
        </InstancyWrapper>`,
    };
    const requestData = qs.stringify(request);

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    this.logger.log('Renew membership request OBJECT', JSON.stringify(request));
    this.logger.log('Renew membership request RAW', requestData);
    this.logger.log('Renew membership response RAW', JSON.stringify(parsed));

    if (!parsed.anyType._) {
      return null;
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];

    if (!response || response?.$?.Result === 'Error') {
      this.logger.error('Error renewMembership', JSON.stringify(response));
      return null;
    }

    return true;
  }

  private async updateMemebership(
    userId: string,
    siteId: string,
    params: IMembershipRequestParams,
    requestParams: IRequestParams,
  ) {
    const path = 'UpdateMemebrship';
    const request = {
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
          <Request SiteID='${siteId}'>
            <UpdateMemebrship>
              <MembershipID>${params.membershipId}</MembershipID>
              <DurationName>${params.durationName}</DurationName>
              <UserID>${userId}</UserID>
              <ExpiryDate>${params.expiryDate}</ExpiryDate>
              <MembershipDurationID>${params.membershipDurationId}</MembershipDurationID>
              <Paymentmode>${params.paymentOption}</Paymentmode>
              <StartDate>${params.startDate}</StartDate>
              <Amount>${params.amount}</Amount>
              <Notes></Notes>
              <RecurringProfileID></RecurringProfileID>
            </UpdateMemebrship>
          </Request>
        </InstancyWrapper>`,
    };
    const requestData = qs.stringify(request);

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    this.logger.log(
      'Update membership request OBJECT',
      JSON.stringify(request),
    );
    this.logger.log('Update membership request RAW', requestData);
    this.logger.log('Update membership response RAW', JSON.stringify(parsed));

    if (!parsed.anyType._) {
      return null;
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];

    if (!response || response?.$?.Result === 'Error') {
      this.logger.error('Error updateMemebership', JSON.stringify(response));
      return null;
    }

    return true;
  }

  private async getMembershipDetails(
    siteId: string,
    requestParams: IRequestParams,
  ) {
    const path = 'MembershipDetails';
    const requestData = qs.stringify({
      astrKey: requestParams.astrKey,
      astrXML: `<InstancyWrapper>
          <Request SiteID='${siteId}'>
            <MembershipDetails>
            </MembershipDetails>
          </Request>
        </InstancyWrapper>`,
    });

    const apiResponse = await this.makeRequest(
      requestData,
      path,
      requestParams.baseUrl,
    );
    const parsed = await xml.parse(apiResponse.data);

    if (!parsed.anyType._) {
      return null;
    }

    const reparsedData = await xml.parse(parsed.anyType._);

    const data = reparsedData?.InstancyWrapper;
    const response = data?.Response?.[0];
    const membershipDetails = data?.MembershipDetails?.[0];

    if (!response || !membershipDetails || response?.$?.Result === 'Error') {
      this.logger.error('Error getMembershipDetails', JSON.stringify(response));
      return null;
    }

    return membershipDetails;
  }

  private getRequestParams(
    packageType: InstancyPackageType,
    isDefaultPackage?: boolean,
  ): IRequestParams | null {
    if (isDefaultPackage) {
      return {
        baseUrl: this.configService.get('INSTANCY_C23_BASE_URL') || '',
        astrKey: this.configService.get('INSTANCY_C23_ASTR_KEY') || '',
      };
    }
    switch (packageType) {
      case InstancyPackageType.ALL_ACCESS:
        return {
          baseUrl:
            this.configService.get('INSTANCY_ALL_ACCESS_PACKAGE_BASE_URL') ||
            '',
          astrKey:
            this.configService.get('INSTANCY_ALL_ACCESS_PACKAGE_ASTR_KEY') ||
            '',
        };
      case InstancyPackageType.ONLINE:
        return {
          baseUrl:
            this.configService.get('INSTANCY_ONLINE_PACKAGE_BASE_URL') || '',
          astrKey:
            this.configService.get('INSTANCY_ONLINE_PACKAGE_ASTR_KEY') || '',
        };
      case InstancyPackageType.VIRTUAL:
        return {
          baseUrl:
            this.configService.get('INSTANCY_VIRTUAL_PACKAGE_BASE_URL') || '',
          astrKey:
            this.configService.get('INSTANCY_VIRTUAL_PACKAGE_ASTR_KEY') || '',
        };
      default:
        return null;
    }
  }

  private makeRequest(data: string, path: string, baseUrl: string) {
    const url = `${baseUrl}/${path}`;
    const config = {
      method: 'POST' as Method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };

    return axios(url, config);
  }
}
