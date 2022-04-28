import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
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
  Response,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as csv from 'fast-csv';
import { Connection } from 'typeorm';
import { Response as ExpressResponse } from 'express';

import { Group } from '@seaccentral/core/dist/group/Group.entity';
import { cacheKeys } from '@seaccentral/core/dist/redis/cacheKeys';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { GroupUser } from '@seaccentral/core/dist/group/GroupUser.entity';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { UserIdentifiers } from '@seaccentral/core/dist/dto/UserIdentifiers.dto';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { RedisCacheService } from '@seaccentral/core/dist/redis/redisCache.service';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import {
  ApiBaseResponse,
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';

import { GroupService } from './group.service';
import { CreateGroupBody } from './dto/CreateGroupBody.dto';
import { GroupUserResponse } from './dto/GroupUserResponse.dto';
import { UpdateGroupBody } from './dto/UpdateGroupBody.dto';

@Controller('v1/group')
@ApiTags('Group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly connection: Connection,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600)
  @CacheKey(cacheKeys.GROUP.ALL)
  async findAll() {
    const response = new BaseResponseDto<Group[]>();
    const groups = await this.groupService.list();

    response.data = groups;

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  @ApiBaseResponse(Group, { pagination: true })
  async search(@Query() query: BaseQueryDto) {
    const response = new BaseResponseDto<Group[]>();

    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const { groups, count } = await this.groupService.search({
      ...query,
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });

    response.data = groups;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/nodes/csv')
  async exportNodesCsv(@Response() res: ExpressResponse) {
    const groups = await this.groupService.listNodes();
    const csvstream = csv.format({ headers: true });
    csvstream.on('error', (error) =>
      res.status(500).json({ error: error.message }),
    );

    groups.forEach((group) => csvstream.write(group));
    csvstream.end();
    res.setHeader('Content-Disposition', 'attachment; filename=groups.csv');
    return csvstream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/descendant')
  async findDescendant(@Param('id') id: string) {
    const response = new BaseResponseDto<Group[]>();
    const group = await this.groupService.findDescendant(id);

    response.data = group;

    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(GroupController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT)
  @Post('/')
  async create(@Body() body: CreateGroupBody) {
    const response = new BaseResponseDto<Group>();
    const group = await this.groupService.create(body);

    response.data = group;

    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(GroupController.prototype.delete))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.connection.transaction((manager) => {
      return this.groupService
        .withTransaction(manager, { excluded: [RedisCacheService] })
        .delete(id);
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/user')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUsers(@Param('id') id: string) {
    const response = new BaseResponseDto<GroupUserResponse[]>();
    const groupUsers = await this.groupService.getUsers(id);

    response.data = groupUsers.map((gu) => new GroupUserResponse(gu));

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/descendant/user')
  @UseInterceptors(ClassSerializerInterceptor)
  async getDescendantUsers(@Param('id') id: string) {
    const response = new BaseResponseDto<GroupUserResponse[]>();
    const groupUsers = await this.groupService.getDescendantUsers(id);

    response.data = groupUsers.map((gu) => new GroupUserResponse(gu));

    return response;
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(GroupController.prototype.addUser))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT)
  @Post('/:id/user/:userId')
  @UseInterceptors(ClassSerializerInterceptor)
  async addUser(@Param('id') id: string, @Param('userId') userId: string) {
    const response = new BaseResponseDto<GroupUser>();
    const groupUser = await this.groupService.addUser(id, userId);

    response.data = groupUser;

    return response;
  }

  @UseGuards(
    JwtAuthGuard,
    PolicyGuard(GroupController.prototype.deleteGroupUser),
  )
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT)
  @Post('/bulk-delete-group-user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroupUser(@Body() body: UserIdentifiers) {
    await this.groupService.deleteUser(body);
  }

  @UseGuards(JwtAuthGuard, PolicyGuard(GroupController.prototype.update))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_GROUP_MANAGEMENT)
  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: Group['id'], @Body() body: UpdateGroupBody) {
    await this.groupService.update(id, body);
  }
}
