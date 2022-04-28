import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';

import { RoleBody } from './dto/RoleBody';
import { RoleService } from './role.service';
import { RoleResponse } from './dto/RoleResponse';
import { UpdateRolePoliciesBody } from './dto/UpdateRolePoliciesBody.dto';

@Controller('v1/roles')
@ApiTags('Role')
export class RoleController {
  constructor(
    private roleService: RoleService,
    private readonly connection: Connection,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(RoleController.prototype.getAllRoles))
  @Policy(
    BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT,
    BACKEND_ADMIN_CONTROL.ACCESS_ORGANIZATION_MANAGEMENT,
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBaseResponse(RoleResponse, { pagination: true })
  async getAllRoles(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const { roles, count } = await this.roleService.getAllRoles({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });
    const response = new BaseResponseDto<RoleResponse[]>();

    response.data = roles.map((role) => new RoleResponse(role));
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Post('')
  @UseGuards(JwtAuthGuard, PolicyGuard(RoleController.prototype.createRole))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @ApiBaseResponse(RoleResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  async createRole(@Body() body: RoleBody) {
    const role = await this.roleService.createRole(body);

    const response = new BaseResponseDto<RoleResponse>();
    response.data = new RoleResponse(role);
    return response;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, PolicyGuard(RoleController.prototype.getById))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @ApiBaseResponse(RoleResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  async getById(
    @Param('id') roleId: string,
    @Query('withPolicies') withRolePolicies = false,
  ) {
    const role = await this.roleService.getById(roleId, { withRolePolicies });

    const response = new BaseResponseDto<RoleResponse>();
    response.data = new RoleResponse(role);
    return response;
  }

  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, PolicyGuard(RoleController.prototype.updateRole))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateRole(@Param('id') roleId: string, @Body() body: RoleBody) {
    await this.roleService.updateRole(roleId, body);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, PolicyGuard(RoleController.prototype.deleteRole))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteRole(@Param('id') roleId: string) {
    await this.roleService.deleteRole(roleId);
  }

  @Put('/:id/policies')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(RoleController.prototype.updateRolePolicies),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_USER_MANAGEMENT)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateRolePolicies(
    @Param('id') roleId: string,
    @Body() body: UpdateRolePoliciesBody,
  ) {
    await this.connection.transaction(async (manager) => {
      await this.roleService
        .withTransaction(manager)
        .updateRolePolicies(roleId, body.policyIds);
    });
  }
}
