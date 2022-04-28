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
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { LearningWay } from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { BaseQueryDto } from '@seaccentral/core/dist/dto/BaseQuery.dto';
import { Connection } from 'typeorm';
import { LearningWayBody } from './dto/LearningWayBody';
import { LearningWayService } from './learning-way.service';

@Controller('/v1/learning_ways')
@ApiTags('LearningWays')
export class LearningWayController {
  constructor(
    private connection: Connection,
    private learningWayService: LearningWayService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async list(@Query() query: BaseQueryDto) {
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<LearningWay[]>();

    const { learningWays, count } = await this.learningWayService.findAll({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
    });

    response.data = learningWays;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Get('/tree')
  @UseGuards(JwtAuthGuard)
  async findTree() {
    const response = new BaseResponseDto<LearningWay[]>();
    const learningWays = await this.learningWayService.findTree();
    response.data = learningWays;

    return response;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string, @Query() query: { related: string }) {
    const response = new BaseResponseDto<LearningWay>();

    response.data = await this.learningWayService.findById(id, query.related);

    return response;
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(LearningWayController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_WAY_MANAGEMENT)
  async create(@Body() body: LearningWayBody) {
    const response = new BaseResponseDto<LearningWay>();

    response.data = await this.learningWayService.create(body);

    return response;
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, PolicyGuard(LearningWayController.prototype.update))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_WAY_MANAGEMENT)
  async update(@Param('id') id: string, @Body() body: LearningWayBody) {
    const response = new BaseResponseDto<LearningWay>();

    response.data = await this.learningWayService.update(id, body);

    return response;
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(LearningWayController.prototype.delete))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_LEARNING_WAY_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Body('ids') ids: string[]) {
    await this.connection.transaction(async (manager) => {
      await this.learningWayService.withTransaction(manager).deleteMany(ids);
    });
  }
}
