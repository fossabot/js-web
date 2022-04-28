import {
  Query,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  Put,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  Delete,
  Logger,
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
  IListParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import IRequestWithUser from '@seaccentral/core/dist/user/IRequestWithUser';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { CertificateUnlockRule } from '@seaccentral/core/dist/certificate/CertificateUnlockRule.entity';

import { CertificateUnlockRuleService } from './certificateUnlockRule.service';
import { CertificateUnlockRuleResponse } from './dto/CertificateUnlockRuleResponse.dto';
import {
  CreateCertificateUnlockRuleBody,
  UpdateCertificateUnlockRuleBody,
} from './dto/CertificateUnlockRuleBody.dto';

@Controller('v1/certificate-unlock-rules')
@ApiTags('Certificate Unlock Rules')
@ApiSecurity('auth_token')
export class CertificateUnlockRuleController {
  private readonly logger = new Logger(CertificateUnlockRuleController.name);

  constructor(
    private readonly certificateUnlockRuleService: CertificateUnlockRuleService,
    private readonly connection: Connection,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateUnlockRuleController.prototype.list),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('')
  async list(@Query() query: IListParams) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const [data, count] = await this.certificateUnlockRuleService.listRules({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });

    const response = new BaseResponseDto<CertificateUnlockRuleResponse[]>();
    response.data = data.map((d) => new CertificateUnlockRuleResponse(d));
    response.pagination = getPaginationResponseParams(query, count);
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateUnlockRuleController.prototype.create),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('')
  async create(
    @Body() body: CreateCertificateUnlockRuleBody,
    @Req() req: IRequestWithUser,
  ) {
    const response = new BaseResponseDto<CertificateUnlockRule>();
    const certificateUnlockRule =
      await this.certificateUnlockRuleService.create(body, req.user);

    response.data = certificateUnlockRule;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateUnlockRuleController.prototype.getById),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = new BaseResponseDto<CertificateUnlockRuleResponse>();

    const certificateUnlockRule =
      await this.certificateUnlockRuleService.getRuleById(id);
    const data = new CertificateUnlockRuleResponse(certificateUnlockRule);

    response.data = data;
    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateUnlockRuleController.prototype.update),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCertificateUnlockRuleBody,
    @Req() req: IRequestWithUser,
  ) {
    await this.connection.transaction(async (manager) => {
      return this.certificateUnlockRuleService
        .withTransaction(manager)
        .update(id, body, req.user);
    });

    this.certificateUnlockRuleService.reindexAllUnlockRuleItems();
  }

  @Delete('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(CertificateUnlockRuleController.prototype.delete),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_CERTIFICATE_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Body() idsBody: UserIdentifiers) {
    await this.connection.transaction((manager) =>
      this.certificateUnlockRuleService
        .withTransaction(manager)
        .deleteMany(idsBody.ids)
        .catch((err) =>
          this.logger.error('Error deleting certificate unlock rule: ', err),
        ),
    );

    this.certificateUnlockRuleService.reindexAllUnlockRuleItems();
  }
}
