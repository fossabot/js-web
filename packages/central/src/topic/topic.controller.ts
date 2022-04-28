import {
  Body,
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
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { Topic } from '@seaccentral/core/dist/topic/Topic.entity';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';

import { TopicBody } from './dto/TopicBody';
import { TopicService } from './topic.service';

@Controller('/v1/topics')
@ApiTags('Topics')
export class TopicController {
  constructor(
    private connection: Connection,
    private topicService: TopicService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async list(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<Topic[]>();

    const { topics, count } = await this.topicService.findAll({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });

    response.data = topics;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Get('/tree')
  @UseGuards(JwtAuthGuard)
  async findTree() {
    const response = new BaseResponseDto<Topic[]>();
    const topics = await this.topicService.findTree();
    response.data = topics;

    return response;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string, @Query() query: { related: string }) {
    const response = new BaseResponseDto<Topic>();

    response.data = await this.topicService.findById(id, query.related);

    return response;
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(TopicController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_TOPIC_MANAGEMENT)
  async create(@Body() body: TopicBody) {
    const response = new BaseResponseDto<Topic>();

    response.data = await this.topicService.create(body);

    return response;
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, PolicyGuard(TopicController.prototype.update))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_TOPIC_MANAGEMENT)
  async update(@Param('id') id: string, @Body() body: TopicBody) {
    const response = new BaseResponseDto<Topic>();

    response.data = await this.topicService.update(id, body);

    return response;
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(TopicController.prototype.delete))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_TOPIC_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Body('ids') ids: string[]) {
    await this.connection.transaction(async (manager) => {
      await this.topicService.withTransaction(manager).deleteMany(ids);
    });
  }
}
