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
import { Tag } from '@seaccentral/core/dist/tag/Tag.entity';
import {
  BaseResponseDto,
  getPaginationRequestParams,
  getPaginationResponseParams,
  getSearchRequestParams,
  getSortRequestParams,
} from '@seaccentral/core/dist/dto/BaseResponse.dto';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { PolicyGuard } from '@seaccentral/core/dist/access-control/policy.guard';
import { Policy } from '@seaccentral/core/dist/access-control/policy.decorator';
import { BACKEND_ADMIN_CONTROL } from '@seaccentral/core/dist/access-control/constants';
import { TagService } from './tag.service';
import { TagBody } from './dto/TagBody.dto';
import { TagListQueryDto } from './dto/TagListQuery.dto';

@Controller('v1/tags')
@ApiTags('Tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: TagListQueryDto) {
    const { type } = query;
    const { skip, take } = getPaginationRequestParams(query);
    const { search, searchField } = getSearchRequestParams(query);
    const { order, orderBy } = getSortRequestParams(query);

    const response = new BaseResponseDto<Tag[]>();

    const { tags, count } = await this.tagService.findAll({
      skip,
      take,
      search,
      searchField,
      order,
      orderBy,
      type,
    });

    response.data = tags;
    response.pagination = getPaginationResponseParams(query, count);

    return response;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    const response = new BaseResponseDto<Tag>();

    response.data = await this.tagService.findById(id);

    return response;
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(TagController.prototype.create))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_TAG_MANAGEMENT)
  async create(@Body() body: TagBody) {
    const response = new BaseResponseDto<Tag>();

    response.data = await this.tagService.create(body);

    return response;
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, PolicyGuard(TagController.prototype.update))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_TAG_MANAGEMENT)
  async update(@Param('id') id: string, @Body() body: TagBody) {
    const response = new BaseResponseDto<Tag>();

    response.data = await this.tagService.update(id, body);

    return response;
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard, PolicyGuard(TagController.prototype.delete))
  @Policy(BACKEND_ADMIN_CONTROL.ACCESS_TAG_MANAGEMENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Body('ids') ids: string[]) {
    this.tagService.deleteMany(ids);
  }
}
