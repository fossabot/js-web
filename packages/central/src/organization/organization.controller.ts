import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Response,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { UserIdentifiers as Identifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { UserUploadFileDto } from '@seaccentral/core/dist/dto/UserUploadFile.dto';
import { UserUploadHistoryDto } from '@seaccentral/core/dist/dto/UserUploadHistory.dto';
import { Organization } from '@seaccentral/core/dist/organization/Organization.entity';
import { UsersService } from '@seaccentral/core/dist/user/users.service';
import { Response as ExpressResponse } from 'express';
import * as csv from 'fast-csv';
import flat from 'flat';
import { Connection } from 'typeorm';
import { GetAllUsers } from '../admin/dto/GetAllUsers.dto';
import IRequestWithUser from '../invitation/interface/IRequestWithUser';
import { OrganizationBody } from './dto/OrganizationBody.dto';
import { OrganizationQueryDto } from './dto/OrganizationQuery.dto';
import { OrganizationResponseDto } from './dto/OrganizationResponse.dto';
import { OrganizationWithSSO } from './dto/OrganizationWithSSO.dto';
import { OrganizationService } from './organization.service';

@ApiSecurity('auth_token')
@Controller('v1/organizations')
@ApiTags('Organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UsersService,
    private readonly connection: Connection,
  ) {}

  @Get('/')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrganizationController.prototype.findAll),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
  )
  @ApiBaseResponse(OrganizationResponseDto, { pagination: true })
  async findAll(
    @Query() query: OrganizationQueryDto,
    @Response() res: ExpressResponse,
  ) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<OrganizationWithSSO[]>();
    const { organizationWithSSOConfig, count } =
      await this.organizationService.list({
        ...query,
        skip,
        take,
        search,
        searchField,
        order,
        orderBy,
      });

    if (query.format === 'csv') {
      const csvstream = csv.format({ headers: true });
      csvstream.on('error', (error) =>
        res.status(500).json({ error: error.message }),
      );
      organizationWithSSOConfig.forEach((o) => csvstream.write(flat(o)));
      csvstream.end();

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=organizations.csv',
      );
      return csvstream.pipe(res);
    }

    response.data = organizationWithSSOConfig.map(
      (o) => new OrganizationWithSSO(o),
    );
    response.pagination = getPaginationResponseParams(query, count);

    return res.json(response);
  }

  @Get('/:id/users')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrganizationController.prototype.findAllUsers),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
  )
  @ApiBaseResponse(GetAllUsers, { pagination: true })
  async findAllUsers(@Param('id') id: string, @Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);

    const response = new BaseResponseDto<GetAllUsers[]>();
    const { organizationUsers, ouCount } =
      await this.organizationService.listUsers(id, { skip, take });

    response.data = organizationUsers.map((ou) => new GetAllUsers(ou));
    response.pagination = getPaginationResponseParams(query, ouCount);

    return response;
  }

  @Delete('/:id/users')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrganizationController.prototype.removeUsers),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async removeUsers(@Param('id') id: string, @Body() userIdsBody: Identifiers) {
    return this.organizationService.removeUsers(id, userIdsBody);
  }

  @Get('/:id')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrganizationController.prototype.findById),
  )
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_COURSE_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBaseResponse(OrganizationResponseDto)
  async findById(@Param('id') id: string) {
    const response = new BaseResponseDto<OrganizationWithSSO>();
    const organization = await this.organizationService.findById(id);

    response.data = new OrganizationWithSSO(organization);

    return response;
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, PolicyGuard(OrganizationController.prototype.update))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async update(
    @Param('id') id: string,
    @Body() organizationBody: OrganizationBody,
  ) {
    return this.connection.transaction(async (manager) => {
      await this.organizationService
        .withTransaction(manager)
        .update(id, organizationBody);
    });
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(OrganizationController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT)
  @ApiBaseResponse(OrganizationResponseDto)
  async create(@Body() organizationBody: OrganizationBody) {
    const response = new BaseResponseDto<OrganizationWithSSO>();
    const organization = await this.organizationService.create(
      organizationBody.name,
    );

    response.data = new OrganizationWithSSO(organization);

    return response;
  }

  @Get('/:id/upload-user')
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrganizationController.prototype.getUserUploadHistory),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT)
  @ApiBaseResponse(UserUploadHistoryDto, { array: true })
  async getUserUploadHistory(
    @Param('id') id: string,
    @Query() query: BaseQueryDto,
  ): Promise<BaseResponseDto<UserUploadHistoryDto[]>> {
    const take = query.perPage || 10;
    const page = query.page || 1;
    const skip = page > 1 ? take * (page - 1) : 0;
    const isValidOrg = await this.organizationService.checkIsExist(id);
    if (!isValidOrg) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Organization not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const response = new BaseResponseDto<UserUploadHistoryDto[]>();
    response.data = await this.userService.getUserUploadHistory(skip, take, id);
    return response;
  }

  @Post(':id/upload-user')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrganizationController.prototype.addUserUploadHistory),
  )
  @ApiBaseResponse(Boolean)
  async addUserUploadHistory(
    @Param('id') id: string,
    @Body() userUploadBody: UserUploadFileDto,
    @Req() request: IRequestWithUser,
  ): Promise<BaseResponseDto<boolean>> {
    const organization = await this.organizationService.findById(id);
    const response = new BaseResponseDto<boolean>();
    response.data = await this.userService.addUserUploadHistory(
      userUploadBody,
      request.user,
      organization.id,
    );
    return response;
  }

  @Post(':id/upload-user/proceed')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(OrganizationController.prototype.proceedUploadedUser),
  )
  async proceedUploadedUser(
    @Param('id') id: string,
    @Query() query: { key: string },
  ) {
    const organization = await this.organizationService.findById(id, false);
    return this.userService.proceedOrganizationUploadedUser(
      organization as Organization,
      query.key,
    );
  }

  @Delete('/')
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT)
  @UseGuards(JwtAuthGuard, PolicyGuard(OrganizationController.prototype.delete))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async delete(@Body() organizationIdsBody: Identifiers) {
    return this.organizationService.delete(organizationIdsBody);
  }
}
